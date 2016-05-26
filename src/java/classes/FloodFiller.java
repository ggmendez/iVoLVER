/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package classes;

import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.MatOfPoint;
import org.opencv.core.Point;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.highgui.Highgui;
import org.opencv.imgproc.Imgproc;
import org.opencv.imgproc.Moments;

/**
 *
 * @author ggmendez
 */
public class FloodFiller {

    private Mat image = null;
    private Scalar meanColor = null;
    private Point topLeftCorner = null;
    private Mat contoursImage = null;
    private Mat morphologicalImage = null;
    private Mat biggestContourImage = null;
    private Rect computedSearchWindow = null;
    private Point massCenter = null;
    private int filledArea = 0;
    private double contourArea = 0;
    private String path = "";
    private String outImageName;
    private HttpServletRequest request = null;
    

    public FloodFiller(Mat image, String outImageName, HttpServletRequest request) {
        this.image = image;
        this.outImageName = outImageName;
        this.request = request;
    }

    public void fillFrom(Point seed, int lo, int up) {

        Scalar backgroundColor = new Scalar(255, 255, 255); // black background
        Scalar contourFillingColor = new Scalar(0, 0, 0); // white filled contour
        fillFrom(seed, lo, up, backgroundColor, contourFillingColor);

        backgroundColor = new Scalar(0, 0, 0); // white background
        contourFillingColor = new Scalar(255, 255, 255); // black filled contour
        fillFrom(seed, lo, up, backgroundColor, contourFillingColor);

    }

    private void fillFrom(Point seed, int lo, int up, Scalar backgroundColor, Scalar contourFillingColor) {

        Mat object = ObjectGenerator.extract(image, seed.x, seed.y, 10, 10);
        this.meanColor = Core.mean(object);

        Rect ccomp = new Rect();
        Mat mask = Mat.zeros(image.rows() + 2, image.cols() + 2, CvType.CV_8UC1);

        int connectivity = 4;
        int newMaskVal = 255;
        int ffillMode = 1;

        int flags = connectivity + (newMaskVal << 8) + (ffillMode == 1 ? Imgproc.FLOODFILL_FIXED_RANGE : 0);

        Scalar newVal = new Scalar(0.299, 0.587, 0.114);

        Imgproc.threshold(mask, mask, 1, 128, Imgproc.THRESH_BINARY);

        filledArea = Imgproc.floodFill(image.clone(), mask, seed, newVal, ccomp, new Scalar(lo, lo, lo), new Scalar(up, up, up), flags);

//        Highgui.imwrite("mask.png", mask);
        ImageUtils.saveImage(mask, "mask.png", request);

        morphologicalImage = new Mat(image.size(), CvType.CV_8UC3);

        Mat element = new Mat(3, 3, CvType.CV_8U, new Scalar(1));

        ArrayList<Mat> mask3 = new ArrayList<Mat>();
        mask3.add(mask);
        mask3.add(mask);
        mask3.add(mask);
        Core.merge(mask3, mask);

        // Applying morphological filters
        Imgproc.erode(mask, morphologicalImage, element);
        Imgproc.morphologyEx(morphologicalImage, morphologicalImage, Imgproc.MORPH_CLOSE, element, new Point(-1, -1), 9);
        Imgproc.morphologyEx(morphologicalImage, morphologicalImage, Imgproc.MORPH_OPEN, element, new Point(-1, -1), 2);
        Imgproc.resize(morphologicalImage, morphologicalImage, image.size());

//        Highgui.imwrite("morphologicalImage.png", morphologicalImage);
        ImageUtils.saveImage(morphologicalImage, "morphologicalImage.png", request);

        List<MatOfPoint> contours = new ArrayList<MatOfPoint>();

        Core.split(mask, mask3);
        Mat binarymorphologicalImage = mask3.get(0);

        Imgproc.findContours(binarymorphologicalImage.clone(), contours, new Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_NONE);

        contoursImage = new Mat(image.size(), CvType.CV_8UC3, backgroundColor);

        int thickness = -1; // Thicknes should be lower than zero in order to drawn the filled contours
        Imgproc.drawContours(contoursImage, contours, -1, contourFillingColor, thickness); // Drawing all the contours found
//        Highgui.imwrite("allContoursImage.png", contoursImage);
        ImageUtils.saveImage(contoursImage, "allContoursImage.png", request);

        if (contours.size() > 1) {

            int minContourWith = 20;
            int minContourHeight = 20;
            int maxContourWith = 6400 / 2;
            int maxContourHeight = 4800 / 2;

            contours = filterContours(contours, minContourWith, minContourHeight, maxContourWith, maxContourHeight);
        }

        if (contours.size() > 0) {

            MatOfPoint biggestContour = contours.get(0); // getting the biggest contour
            contourArea = Imgproc.contourArea(biggestContour);

            if (contours.size() > 1) {
                biggestContour = Collections.max(contours, new ContourComparator()); // getting the biggest contour in case there are more than one
            }

            Point[] points = biggestContour.toArray();
            path = "M " + (int) points[0].x + " " + (int) points[0].y + " ";
            for (int i = 1; i < points.length; ++i) {
                Point v = points[i];
                path += "L " + (int) v.x + " " + (int) v.y + " ";
            }
            path += "Z";

            biggestContourImage = new Mat(image.size(), CvType.CV_8UC3, backgroundColor);

            Imgproc.drawContours(biggestContourImage, contours, 0, contourFillingColor, thickness);

//            Highgui.imwrite("biggestContourImage.png", biggestContourImage);
            ImageUtils.saveImage(biggestContourImage, "biggestContourImage.png", request);

            Mat maskForColorExtraction = biggestContourImage.clone();

            if (isWhite(backgroundColor)) {
                Imgproc.dilate(maskForColorExtraction, maskForColorExtraction, new Mat(), new Point(-1, -1), 3);
            } else {
                Imgproc.erode(maskForColorExtraction, maskForColorExtraction, new Mat(), new Point(-1, -1), 3);
            }

//            Highgui.imwrite("maskForColorExtraction.png", maskForColorExtraction);
            ImageUtils.saveImage(maskForColorExtraction, "maskForColorExtraction.png", request);

            Mat extractedColor = new Mat();

            if (isBlack(backgroundColor) && isWhite(contourFillingColor)) {
                Core.bitwise_and(maskForColorExtraction, image, extractedColor);

            } else {
                Core.bitwise_or(maskForColorExtraction, image, extractedColor);
            }

//            Highgui.imwrite("extractedColor.png", extractedColor);
            ImageUtils.saveImage(extractedColor, "extractedColor.png", request);

            computedSearchWindow = Imgproc.boundingRect(biggestContour);
            topLeftCorner = computedSearchWindow.tl();

            Rect croppingRect = new Rect(computedSearchWindow.x, computedSearchWindow.y, computedSearchWindow.width - 1, computedSearchWindow.height - 1);

            Mat imageForTextRecognition = new Mat(extractedColor.clone(), croppingRect);
//            Highgui.imwrite(outImageName, imageForTextRecognition);
            ImageUtils.saveImage(imageForTextRecognition, outImageName, request);
            
            
            
//            
//
//            Mat data = new Mat(imageForTextRecognition.size(), CvType.CV_8UC3, backgroundColor);
//            imageForTextRecognition.copyTo(data);
//            data.convertTo(data, CvType.CV_8UC3);
//
//            // The meanColor variable represents the color in the GBR space, the following line transforms this to the RGB color space, which
//            // is assumed in the prepareImage method of the TextRecognitionPreparer class
//            Scalar userColor = new Scalar(meanColor.val[2], meanColor.val[1], meanColor.val[0]);
//
//            ArrayList<String> recognizableImageNames = TextRecognitionPreparer.generateRecognizableImagesNames(data, backgroundColor, userColor);
//            for (String imageName : recognizableImageNames) {
//
//                try {
//                    // First recognition step
//                    String recognizedText = TextRecognizer.recognize(imageName, true).trim();
//                    if (recognizedText != null && !recognizedText.isEmpty()) {
//                        recognizedStrings.add(recognizedText);
//                    }
//                    // Second recognition step
//                    recognizedText = TextRecognizer.recognize(imageName, false).trim();
//                    if (recognizedText != null && !recognizedText.isEmpty()) {
//                        recognizedStrings.add(recognizedText);
//                    }
//                    
//                } catch (Exception e) {
//                }
//            }
//            
////            ArrayList<BufferedImage> recognizableBufferedImages = TextRecognitionPreparer.generateRecognizableBufferedImages(data, backgroundColor, userColor);
////            for (BufferedImage bufferedImage : recognizableBufferedImages) {
////                try {
////                    // First recognition step
////                    String recognizedText = TextRecognizer.recognize(bufferedImage, true).trim();
////                    if (recognizedText != null && !recognizedText.isEmpty()) {
////                        recognizedStrings.add(recognizedText);
////                    }
////                    // Second recognition step
////                    recognizedText = TextRecognizer.recognize(bufferedImage, false).trim();
////                    if (recognizedText != null && !recognizedText.isEmpty()) {
////                        recognizedStrings.add(recognizedText);
////                    }
////                    
////                } catch (Exception e) {
////                }
////            }
//
//            
//            
            
            
            
            
            
            
            
            // compute all moments
            Moments mom = Imgproc.moments(biggestContour);
            massCenter = new Point(mom.get_m10() / mom.get_m00(), mom.get_m01() / mom.get_m00());

            // draw black dot
            Core.circle(contoursImage, massCenter, 4, contourFillingColor, 8);
        }

    }

    private static ArrayList<MatOfPoint> filterContours(List<MatOfPoint> contours, int minContourWith, int minContourHeight, int maxContourWith, int maxContourHeight) {
        ArrayList<MatOfPoint> results = new ArrayList<MatOfPoint>();
        for (MatOfPoint currentContour : contours) {
            Rect boundingBox = Imgproc.boundingRect(currentContour);
            if (boundingBox.width > minContourWith && boundingBox.height > minContourHeight) {
                if (boundingBox.width < maxContourWith && boundingBox.height < maxContourHeight) {
                    results.add(currentContour);
                }
            }
        }
        return results;
    }

    public boolean isBlack(Scalar color) {
        return (color.val[0] == 0 && color.val[1] == 0 && color.val[2] == 0);
    }

    public boolean isWhite(Scalar color) {
        return (color.val[0] == 255 && color.val[1] == 255 && color.val[2] == 255);
    }

    public Mat getImage() {
        return image;
    }

    public void setImage(Mat image) {
        this.image = image;
    }

    public Scalar getMeanColor() {
        return meanColor;
    }

    public void setMeanColor(Scalar meanColor) {
        this.meanColor = meanColor;
    }

    public Point getTopLeftCorner() {
        return topLeftCorner;
    }

    public void setTopLeftCorner(Point topLeftCorner) {
        this.topLeftCorner = topLeftCorner;
    }

    public Mat getContoursImage() {
        return contoursImage;
    }

    public void setContoursImage(Mat contoursImage) {
        this.contoursImage = contoursImage;
    }

    public Mat getMorphologicalImage() {
        return morphologicalImage;
    }

    public void setMorphologicalImage(Mat morphologicalImage) {
        this.morphologicalImage = morphologicalImage;
    }

    public Mat getBiggestContourImage() {
        return biggestContourImage;
    }

    public void setBiggestContourImage(Mat biggestContourImage) {
        this.biggestContourImage = biggestContourImage;
    }

    public Rect getComputedSearchWindow() {
        return computedSearchWindow;
    }

    public void setComputedSearchWindow(Rect computedSearchWindow) {
        this.computedSearchWindow = computedSearchWindow;
    }

    public Point getMassCenter() {
        return massCenter;
    }

    public void setMassCenter(Point massCenter) {
        this.massCenter = massCenter;
    }

    public int getFilledArea() {
        return filledArea;
    }

    public void setFilledArea(int filledArea) {
        this.filledArea = filledArea;
    }

    public double getContourArea() {
        return contourArea;
    }

    public void setContourArea(double contourArea) {
        this.contourArea = contourArea;
    }

//    public ArrayList<String> getRecognizedStrings() {
//        return recognizedStrings;
//    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getOutImageName() {
        return outImageName;
    }

    public void setOutImageName(String outImageName) {
        this.outImageName = outImageName;
    }    

}

///*
// * To change this license header, choose License Headers in Project Properties.
// * To change this template file, choose Tools | Templates
// * and open the template in the editor.
// */
//package classes;
//
//import java.util.ArrayList;
//import java.util.Collections;
//import java.util.List;
//import org.opencv.core.Core;
//import org.opencv.core.CvType;
//import org.opencv.core.Mat;
//import org.opencv.core.MatOfPoint;
//import org.opencv.core.Point;
//import org.opencv.core.Rect;
//import org.opencv.core.Scalar;
//import org.opencv.highgui.Highgui;
//import org.opencv.imgproc.Imgproc;
//import org.opencv.imgproc.Moments;
//
///**
// *
// * @author ggmendez
// */
//public class FloodFiller {
//
//    private Mat image = null;
//    private Scalar meanColor = null;
//    private Point topLeftCorner = null;
//    private Mat contoursImage = null;
//    private Mat biggestContourImage = null;
//    private Rect computedSearchWindow = null;
//    private Point massCenter = null;
//    private int filledArea;
//    private double contourArea;
//
//    public FloodFiller(Mat image) {
//        this.image = image;
//    }
//
//    public String fillFrom(Point seed, int lo, int up) {
//
//        String path = "";
//
//        Mat object = ObjectGenerator.extract(image, seed.x, seed.y, 10, 10);
//        this.meanColor = Core.mean(object);
//
//        Rect ccomp = new Rect();
//        Mat mask = Mat.zeros(image.rows() + 2, image.cols() + 2, CvType.CV_8UC1);
//
//        int connectivity = 4;
//        int newMaskVal = 255;
//        int ffillMode = 1;
//
//        int flags = connectivity + (newMaskVal << 8) + (ffillMode == 1 ? Imgproc.FLOODFILL_FIXED_RANGE : 0);
//
//        Scalar newVal = new Scalar(0.299, 0.587, 0.114);
//
//        Imgproc.threshold(mask, mask, 1, 128, Imgproc.THRESH_BINARY);
//
////        OpenCVTest.imshow(image, "image");
//        filledArea = Imgproc.floodFill(image, mask, seed, newVal, ccomp, new Scalar(lo, lo, lo), new Scalar(up, up, up), flags);
//
////        OpenCVTest.imshow(image, "image");
////        OpenCVTest.imshow(mask, "mask");
////        Highgui.imwrite("mask.png", mask);
//        Mat morphologicalImage = new Mat();
//
////        Mat element = new Mat(5, 5, CvType.CV_8U, new Scalar(1));
//        Mat element = new Mat(3, 3, CvType.CV_8U, new Scalar(1));
//        Imgproc.erode(mask, morphologicalImage, element);
//        Imgproc.morphologyEx(morphologicalImage, morphologicalImage, Imgproc.MORPH_CLOSE, element, new Point(-1, -1), 9);
////        Imgproc.morphologyEx(morphologicalImage, morphologicalImage, Imgproc.MORPH_CLOSE, element, new Point(-1, -1), 2);
//        Imgproc.morphologyEx(morphologicalImage, morphologicalImage, Imgproc.MORPH_OPEN, element, new Point(-1, -1), 2);
//
//        Highgui.imwrite("morphologicalImage.png", morphologicalImage);
//
//        List<MatOfPoint> contours = new ArrayList<MatOfPoint>();
//        Imgproc.findContours(morphologicalImage.clone(), contours, new Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_NONE);
//
//        // Draw black contours on a white image
//        contoursImage = new Mat(morphologicalImage.size(), CvType.CV_8U, new Scalar(255));
//        Scalar color = new Scalar(0);
//        int thickness = 2;
//        Imgproc.drawContours(contoursImage, contours, -1, color, thickness);
//        Highgui.imwrite("allContoursImage.png", contoursImage);
//
//        if (contours.size() > 1) {
//
//            int minContourWith = 20;
//            int minContourHeight = 20;
//            int maxContourWith = 6400 / 2;
//            int maxContourHeight = 4800 / 2;
//
//            contours = filterContours(contours, minContourWith, minContourHeight, maxContourWith, maxContourHeight);
//        }
//
//        if (contours.size() > 0) {
//
//            MatOfPoint biggestContour = contours.get(0); // getting the bigger contour
//            contourArea = Imgproc.contourArea(biggestContour);
//
//            if (contours.size() > 1) {
//                biggestContour = Collections.max(contours, new ContourComparator()); // getting the biggest contour in case there are more than one
//            }
//
//            Point[] points = biggestContour.toArray();
//            path = "M " + (int) points[0].x + " " + (int) points[0].y + " ";
//            for (int i = 1; i < points.length; ++i) {
//                Point v = points[i];
//                path += "L " + (int) v.x + " " + (int) v.y + " ";
//            }
//            path += "Z";
//
//            // draw all contours in black with a thickness of 2
//            biggestContourImage = Mat.zeros(morphologicalImage.size(), CvType.CV_8UC1);
//            ArrayList<MatOfPoint> biggestContourList = new ArrayList<MatOfPoint>();
//            biggestContourList.add(biggestContour);
//            Imgproc.drawContours(biggestContourImage, biggestContourList, -1, color, thickness); //
//
////            
////            
////            Mat colorArea = Mat.zeros(morphologicalImage.size(), CvType.CV_8UC1);
////            Core.bitwise_and(biggestContourImage, morphologicalImage, colorArea);
////            
////            Highgui.imwrite("colorArea_antes.png", colorArea);
////            
////            ArrayList<Mat> list = new ArrayList<Mat>();
////            list.add(colorArea);
////            list.add(colorArea);
////            list.add(colorArea);
////            
////            Core.merge(list, colorArea);
////            
////            
////            Core.bitwise_and(colorArea, image, colorArea);
////            Highgui.imwrite("colorArea_Despues.png", colorArea);
////            
////            
//            // testing the bounding box
//            computedSearchWindow = Imgproc.boundingRect(biggestContour);
//
//            topLeftCorner = computedSearchWindow.tl();
//
//            // compute all moments
//            Moments mom = Imgproc.moments(biggestContour);
//
//            massCenter = new Point(mom.get_m10() / mom.get_m00(), mom.get_m01() / mom.get_m00());
//
//            // draw black dot
//            Core.circle(contoursImage, massCenter, 4, color, 8);
//        }
//
//        Highgui.imwrite("biggestContourImage.png", biggestContourImage);
//
//        return path;
//
//    }
//
//    private static ArrayList<MatOfPoint> filterContours(List<MatOfPoint> contours, int minContourWith, int minContourHeight, int maxContourWith, int maxContourHeight) {
//        ArrayList<MatOfPoint> results = new ArrayList<MatOfPoint>();
//        for (MatOfPoint currentContour : contours) {
//            Rect boundingBox = Imgproc.boundingRect(currentContour);
//            if (boundingBox.width > minContourWith && boundingBox.height > minContourHeight) {
//                if (boundingBox.width < maxContourWith && boundingBox.height < maxContourHeight) {
//                    results.add(currentContour);
//                }
//            }
//        }
//        return results;
//    }
//
//    private static void applyMorphologicalFilters(Mat image) {
//        Mat element = new Mat(3, 3, CvType.CV_8U, new Scalar(1));
//        Imgproc.erode(image, image, element);
//        Imgproc.morphologyEx(image, image, Imgproc.MORPH_CLOSE, element, new Point(-1, -1), 2);
//        Imgproc.morphologyEx(image, image, Imgproc.MORPH_OPEN, element, new Point(-1, -1), 2);
//    }
//
//    public Mat getImage() {
//        return image;
//    }
//
//    public void setImage(Mat image) {
//        this.image = image;
//    }
//
//    public Scalar getMeanColor() {
//        return meanColor;
//    }
//
//    public void setMeanColor(Scalar meanColor) {
//        this.meanColor = meanColor;
//    }
//
//    public Point getTopLeftCorner() {
//        return topLeftCorner;
//    }
//
//    public void setTopLeftCorner(Point topLeftCorner) {
//        this.topLeftCorner = topLeftCorner;
//    }
//
//    public Mat getContoursImage() {
//        return contoursImage;
//    }
//
//    public void setContoursImage(Mat contoursImage) {
//        this.contoursImage = contoursImage;
//    }
//
//    public Mat getBiggestContourImage() {
//        return biggestContourImage;
//    }
//
//    public void setBiggestContourImage(Mat biggestContourImage) {
//        this.biggestContourImage = biggestContourImage;
//    }
//
//    public Rect getComputedSearchWindow() {
//        return computedSearchWindow;
//    }
//
//    public void setComputedSearchWindow(Rect computedSearchWindow) {
//        this.computedSearchWindow = computedSearchWindow;
//    }
//
//    public Point getMassCenter() {
//        return massCenter;
//    }
//
//    public void setMassCenter(Point massCenter) {
//        this.massCenter = massCenter;
//    }
//
//    public int getFilledArea() {
//        return filledArea;
//    }
//
//    public void setFilledArea(int filledArea) {
//        this.filledArea = filledArea;
//    }
//
//    public double getContourArea() {
//        return contourArea;
//    }
//
//    public void setContourArea(double contourArea) {
//        this.contourArea = contourArea;
//    }
//    
//    
//}
