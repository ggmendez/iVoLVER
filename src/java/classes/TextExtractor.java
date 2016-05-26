/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package classes;

import java.util.ArrayList;
import javax.servlet.http.HttpServletRequest;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.Point;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.core.Size;
import org.opencv.highgui.Highgui;
import org.opencv.imgproc.Imgproc;

/**
 *
 * @author ggmendez
 */
public class TextExtractor {

    private final Mat image;
    private final String imageID;
    private final ArrayList<String> recognizedStrings = new ArrayList<String>();
    private HttpServletRequest request = null;

    public TextExtractor(Mat image, String imageID, HttpServletRequest request) {
        this.image = image;
        this.imageID = imageID;
        this.request = request;
    }

    public void extractText(Scalar meanColor) {

        ArrayList<String> recognizableImageNames = TextRecognitionPreparer.generateRecognizableImagesNames(image, meanColor, imageID, request);

        for (String imageName : recognizableImageNames) {

            try {

                // First recognition step
                String recognizedText2 = TextRecognizer.recognize(imageName, false).trim();
                if (recognizedText2 != null && !recognizedText2.isEmpty()) {
                    recognizedStrings.add(recognizedText2);
                }
                
                // Second recognition step
                String recognizedText1 = TextRecognizer.recognize(imageName, true).trim();
                if (recognizedText1 != null && !recognizedText1.isEmpty()) {
                    recognizedStrings.add(recognizedText1);
                }

            } catch (Exception e) {
            }
        }

//            ArrayList<BufferedImage> recognizableBufferedImages = TextRecognitionPreparer.generateRecognizableBufferedImages(data, backgroundColor, userColor);
//            for (BufferedImage bufferedImage : recognizableBufferedImages) {
//                try {
//                    // First recognition step
//                    String recognizedText = TextRecognizer.recognize(bufferedImage, true).trim();
//                    if (recognizedText != null && !recognizedText.isEmpty()) {
//                        recognizedStrings.add(recognizedText);
//                    }
//                    // Second recognition step
//                    recognizedText = TextRecognizer.recognize(bufferedImage, false).trim();
//                    if (recognizedText != null && !recognizedText.isEmpty()) {
//                        recognizedStrings.add(recognizedText);
//                    }
//                    
//                } catch (Exception e) {
//                }
//            }
    }

    public Mat getImage() {
        return image;
    }

    public ArrayList<String> getRecognizedStrings() {
        return recognizedStrings;
    }
    
    private static Point transformPoint(Point point, Mat transformationMatrix) {        
        double newX = transformationMatrix.get(0, 0)[0] * point.x + transformationMatrix.get(0, 1)[0] * point.y + transformationMatrix.get(0, 2)[0];
        double newY = transformationMatrix.get(1, 0)[0] * point.x + transformationMatrix.get(1, 1)[0] * point.y + transformationMatrix.get(1, 2)[0];
        return new Point(newX, newY);
    }

    public void extractText(Rect roi, double roiAngle) throws Exception {

        Point roiTopLeft = roi.tl();

        double radians = Math.toRadians(roiAngle);
        double sin = Math.abs(Math.sin(radians));
        double cos = Math.abs(Math.cos(radians));

        int newWidth = (int) (image.width() * cos + image.height() * sin);
        int newHeight = (int) (image.width() * sin + image.height() * cos);

        int[] newWidthHeight = {newWidth, newHeight};

        int pivotX = newWidthHeight[0] / 2;
        int pivotY = newWidthHeight[1] / 2;

        Point center = new Point(pivotX, pivotY);        
        
        Size targetSize = new Size(newWidthHeight[0], newWidthHeight[1]);

        Mat intermediateImage = new Mat(targetSize, image.type());

        int offsetX = (newWidthHeight[0] - image.width()) / 2;
        int offsetY = (newWidthHeight[1] - image.height()) / 2;
        
        Point paddedTopLeft = new Point(roiTopLeft.x + offsetX, roiTopLeft.y + offsetY);

        Mat containerImage = intermediateImage.submat(offsetY, offsetY + image.height(), offsetX, offsetX + image.width());
        image.copyTo(containerImage);

        Mat rotationMatrix = Imgproc.getRotationMatrix2D(center, roiAngle, 1.0);
        
        Point transformedTopLeft = transformPoint (paddedTopLeft, rotationMatrix);
        
        
        
        Mat rotatedImage = new Mat();
        Imgproc.warpAffine(intermediateImage, rotatedImage, rotationMatrix, targetSize, Imgproc.INTER_LINEAR, Imgproc.BORDER_CONSTANT, new Scalar(0));
        
        ImageUtils.saveImage(rotatedImage, imageID + "_rotatedImage.png", request);
        
        
        double adjustedWidth = roi.size().width;
        double adjustedHeight = roi.size().height;
        
        if (transformedTopLeft.x + adjustedWidth > rotatedImage.width()) {
            adjustedWidth = rotatedImage.width() - transformedTopLeft.x;
        }
        
        if (transformedTopLeft.y + adjustedHeight > rotatedImage.height()) {
            adjustedHeight = rotatedImage.height() - transformedTopLeft.y;
        }
        
        
        Rect newROI = new Rect(transformedTopLeft, new Size(adjustedWidth, adjustedHeight));
        
        
        

        Mat extractedROI = new Mat(rotatedImage, newROI);
        
        String fileName = ImageUtils.saveImage(extractedROI, imageID + "_ROI.png", request);
        
        extractText(fileName);
    }

    public void extractText(String imageName) throws Exception {       
        
        // First recognition step
        String recognizedText1 = TextRecognizer.recognizeInSkewedImage(imageName, true).trim();
        if (recognizedText1 != null && !recognizedText1.isEmpty()) {
            recognizedStrings.add(recognizedText1);
        }

        // Second recognition step
        String recognizedText2 = TextRecognizer.recognizeInSkewedImage(imageName, false).trim();
        if (recognizedText2 != null && !recognizedText2.isEmpty()) {
            recognizedStrings.add(recognizedText2);
        }
        
        // First recognition step
        String recognizedText3 = TextRecognizer.recognize(imageName, true).trim();
        if (recognizedText3 != null && !recognizedText3.isEmpty()) {
            recognizedStrings.add(recognizedText3);
        }

        // Second recognition step
        String recognizedText4 = TextRecognizer.recognize(imageName, false).trim();
        if (recognizedText4 != null && !recognizedText4.isEmpty()) {
            recognizedStrings.add(recognizedText4);
        }

    }

}
