/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package classes;

/**
 *
 * @author ggmendez
 */
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.servlet.http.HttpServletRequest;
import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.Point;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.core.Size;
import org.opencv.core.TermCriteria;
import org.opencv.highgui.Highgui;
import org.opencv.imgproc.Imgproc;
import org.opencv.video.BackgroundSubtractorMOG2;

public class TextRecognitionPreparer {
    
    public static void prepareImage (String fileName, Scalar backgroundColor, Scalar userPickedColor) {
        Mat img = Highgui.imread(fileName);
        generateRecognizableImages (img, backgroundColor, userPickedColor);
    }
    
    public static ArrayList<String> generateRecognizableImagesNames (Mat img, Scalar userPickedColor, String imageID, HttpServletRequest request) {
        
        ArrayList<String> imageNames = new ArrayList<String>();
        
        Mat filledImage = img.clone();
        Scalar newVal = new Scalar(userPickedColor.val[2], userPickedColor.val[1], userPickedColor.val[0]);
        
        Imgproc.floodFill(filledImage, new Mat(), new Point(0, 0), newVal);
        String file1 = imageID + "_filledImage.png";
//        Highgui.imwrite(file1, filledImage);
        imageNames.add(ImageUtils.saveImage(filledImage, file1, request));
        
        Mat filledGrayImage = new Mat();
        Imgproc.cvtColor(filledImage, filledGrayImage, Imgproc.COLOR_BGR2GRAY);
        String file2 = imageID + "_filledGrayImage.png";
//        Highgui.imwrite(file2, filledGrayImage);
        imageNames.add(ImageUtils.saveImage(filledGrayImage, file2, request));
        
        Mat gaussianGrayImage = new Mat();
        Imgproc.GaussianBlur(filledGrayImage, gaussianGrayImage, new Size(0, 0), 3);
        Core.addWeighted(filledGrayImage, 3.5, gaussianGrayImage, -1, 0, gaussianGrayImage);
        String file3 = imageID + "_sharpenedImage.png";
//        Highgui.imwrite(file3, gaussianGrayImage);
        imageNames.add(ImageUtils.saveImage(gaussianGrayImage, file3, request));
        
//        Mat filledBinarizedImage2 = new Mat();
//        Imgproc.adaptiveThreshold(filledGrayImage, filledBinarizedImage2, 255, Imgproc.ADAPTIVE_THRESH_MEAN_C, Imgproc.THRESH_BINARY, 75, 10);
//        String file5 = imageID + "_filledBinarizedImage2.png";  
////        Highgui.imwrite(file11, filledBinarizedImage2);
//        imageNames.add(ImageUtils.saveImage(filledBinarizedImage2, file5));
//        
//        Mat filledBinarizedImage1 = new Mat();
//        Imgproc.adaptiveThreshold(filledGrayImage, filledBinarizedImage1, 255, Imgproc.ADAPTIVE_THRESH_MEAN_C, Imgproc.THRESH_BINARY, 15, 4);
//        String file4 = imageID + "_filledBinarizedImage1.png";  
////        Highgui.imwrite(file4, filledBinarizedImage1);
//        imageNames.add(ImageUtils.saveImage(filledBinarizedImage1, file4));

        return imageNames;
    }
    
    public static ArrayList<BufferedImage> generateRecognizableBufferedImages (Mat img, Scalar backgroundColor, Scalar userPickedColor) {
        
        ArrayList<BufferedImage> images = new ArrayList<BufferedImage>();
        
        Mat filledImage = img.clone();
        Scalar newVal = new Scalar(userPickedColor.val[2], userPickedColor.val[1], userPickedColor.val[0]);
        
        Imgproc.floodFill(filledImage, new Mat(), new Point(0, 0), newVal);
        images.add(Util.mat2Img(filledImage));
        
        Mat filledGrayImage = new Mat();
        Imgproc.cvtColor(filledImage, filledGrayImage, Imgproc.COLOR_BGR2GRAY);
        images.add(Util.mat2Img(filledGrayImage));
        
        Mat gaussianGrayImage = new Mat();
        Imgproc.GaussianBlur(filledGrayImage, gaussianGrayImage, new Size(0, 0), 3);
        Core.addWeighted(filledGrayImage, 3.5, gaussianGrayImage, -1, 0, gaussianGrayImage);
        images.add(Util.mat2Img(gaussianGrayImage));
        
        Mat filledBinarizedImage2 = new Mat();
        Imgproc.adaptiveThreshold(filledGrayImage, filledBinarizedImage2, 255, Imgproc.ADAPTIVE_THRESH_MEAN_C, Imgproc.THRESH_BINARY, 75, 10);
        images.add(Util.mat2Img(filledBinarizedImage2));
        
        Mat filledBinarizedImage1 = new Mat();
        Imgproc.adaptiveThreshold(filledGrayImage, filledBinarizedImage1, 255, Imgproc.ADAPTIVE_THRESH_MEAN_C, Imgproc.THRESH_BINARY, 15, 4);
        images.add(Util.mat2Img(filledBinarizedImage1));

        
        return images;
    }

    public static ArrayList<Mat> generateRecognizableImages (Mat img, Scalar backgroundColor, Scalar userPickedColor) {
        
        ArrayList<Mat> images = new ArrayList<Mat>();
        
        Mat filledImage = img.clone();
        Scalar newVal = new Scalar(userPickedColor.val[2], userPickedColor.val[1], userPickedColor.val[0]);
        Imgproc.floodFill(filledImage, new Mat(), new Point(0, 0), newVal);
        String file1 = "filledImage.png";
//        Highgui.imwrite(file1, filledImage);
        images.add(filledImage);
        
        Mat filledGrayImage = new Mat();
        Imgproc.cvtColor(filledImage, filledGrayImage, Imgproc.COLOR_BGR2GRAY);
        String file2 = "filledGrayImage.png";
//        Highgui.imwrite(file2, filledGrayImage);
        images.add(filledGrayImage);
        
        Mat gaussianGrayImage = new Mat();
        Imgproc.GaussianBlur(filledGrayImage, gaussianGrayImage, new Size(0, 0), 3);
        Core.addWeighted(filledGrayImage, 3.5, gaussianGrayImage, -1, 0, gaussianGrayImage);
//        Core.addWeighted(filledGrayImage, 2.5, gaussianGrayImage, -0.5, 0, gaussianGrayImage);
        String file3 = "sharpenedImage.png";
//        Highgui.imwrite(file3, gaussianGrayImage);
        images.add(gaussianGrayImage);

        
        Mat filledBinarizedImage = new Mat();
        Imgproc.adaptiveThreshold(filledGrayImage, filledBinarizedImage, 255, Imgproc.ADAPTIVE_THRESH_MEAN_C, Imgproc.THRESH_BINARY, 15, 4);
        String file4 = "filledBinarizedImage.png";  
//        Highgui.imwrite(file4, filledBinarizedImage);
        images.add(filledBinarizedImage);
        
//        BackgroundSubtractorMOG2 backgroundSubtractorMOG2 = new BackgroundSubtractorMOG2();
//        Mat foregroundMask = new Mat();
//        backgroundSubtractorMOG2.apply(img, foregroundMask);
//        Highgui.imwrite("mFGMask.png", foregroundMask);

        Scalar fillingColor = cluster(userPickedColor, img, 3);

        Mat replacedColor = replaceColor(img, backgroundColor, fillingColor);
        String file5 = "replacedColor.png";
//        Highgui.imwrite(file5, replacedColor);
        images.add(replacedColor);
        
        Mat grayImage = new Mat();
        Imgproc.cvtColor(replacedColor, grayImage, Imgproc.COLOR_BGR2GRAY);
        String file6 = "grayImage.png";
//        Highgui.imwrite(file6, grayImage);
        images.add(grayImage);

        Mat binarized = new Mat();
        Imgproc.adaptiveThreshold(grayImage, binarized, 255, Imgproc.ADAPTIVE_THRESH_MEAN_C, Imgproc.THRESH_BINARY, 15, 4);
        String file7 = "binarized.png";
//        Highgui.imwrite(file7, binarized);
        images.add(binarized);
        
        Mat colorReplacedEqualized = equalizeIntensity(replacedColor);
        String file8 = "colorReplacedEqualized.png";
//        Highgui.imwrite(file8, colorReplacedEqualized);
        images.add(colorReplacedEqualized);
        
        Mat colorReducedImage = reduceColor(replacedColor, 64);
        String file9 = "replacedColorColorReduced.png";
//        Highgui.imwrite(file9, colorReducedImage);
        images.add(colorReducedImage);
        
        // Equalizing image
        Mat colorReducedEqualized = equalizeIntensity(colorReducedImage);
        String file10 = "colorReducedEqualized.png";
//        Highgui.imwrite(file10, colorReducedEqualized);
        images.add(colorReducedEqualized);
        
        
        return images;


    }

    public static Scalar cluster(Scalar userColor, Mat cutout, int k) {

        Mat samples = cutout.reshape(1, cutout.cols() * cutout.rows());
        Mat samples32f = new Mat();
        samples.convertTo(samples32f, CvType.CV_32F, 1.0 / 255.0);

        Mat labels = new Mat();
        TermCriteria criteria = new TermCriteria(TermCriteria.COUNT, 100, 1);
        Mat centers = new Mat();
        Core.kmeans(samples32f, k, labels, criteria, 1, Core.KMEANS_PP_CENTERS, centers);

        Scalar fillingColor = getFillingColor(userColor, cutout, labels, centers);

        return fillingColor;
    }

    private static Scalar getFillingColor(Scalar userColor, Mat cutout, Mat labels, Mat centers) {

        double minDistance = 1000000;
        Scalar fillingColor = null;

        centers.convertTo(centers, CvType.CV_8UC1, 255.0);
        centers.reshape(3);

        List<Mat> clusters = new ArrayList<Mat>();
        for (int i = 0; i < centers.rows(); i++) {
            clusters.add(Mat.zeros(cutout.size(), cutout.type()));
        }

        Map<Integer, Integer> counts = new HashMap<Integer, Integer>();
        for (int i = 0; i < centers.rows(); i++) {
            counts.put(i, 0);
        }

        int rows = 0;
        for (int y = 0; y < cutout.rows(); y++) {
            for (int x = 0; x < cutout.cols(); x++) {
                int label = (int) labels.get(rows, 0)[0];
                int r = (int) centers.get(label, 2)[0];
                int g = (int) centers.get(label, 1)[0];
                int b = (int) centers.get(label, 0)[0];
                counts.put(label, counts.get(label) + 1);
                clusters.get(label).put(y, x, b, g, r);
                rows++;
            }
        }

        Set<Integer> keySet = counts.keySet();
        Iterator<Integer> iterator = keySet.iterator();
        while (iterator.hasNext()) {

            int label = (int) iterator.next();
            int r = (int) centers.get(label, 2)[0];
            int g = (int) centers.get(label, 1)[0];
            int b = (int) centers.get(label, 0)[0];

            Scalar currentColor = new Scalar(r, g, b);

            double distance = getColorDistance(currentColor, userColor);

            if (distance < minDistance) {
                minDistance = distance;
                fillingColor = currentColor;
            }

        }

        return fillingColor;
    }

    static double getColorDistance(Scalar color1, Scalar color2) {
        return Math.abs(color1.val[0] - color2.val[0]) + Math.abs(color1.val[1] - color2.val[1]) + Math.abs(color1.val[2] - color2.val[2]);
    }

    static Mat replaceColor(Mat image, Scalar color1, Scalar color2) {

        Mat replaced = image.clone();

        for (int y = 0; y < image.rows(); y++) {
            for (int x = 0; x < image.cols(); x++) {
                double[] values = image.get(y, x);
                double r = values[0];
                double g = values[1];
                double b = values[2];

                if (b == color1.val[0] && g == color1.val[1] && r == color1.val[2]) {
                    values[0] = color2.val[2];
                    values[1] = color2.val[1];
                    values[2] = color2.val[0];

                }
                replaced.put(y, x, values);

            }
        }

        return replaced;

    }

    public static Mat equalizeIntensity(Mat inputImage) {

        if (inputImage.channels() >= 3) {

            Mat ycrcb = new Mat();

            Imgproc.cvtColor(inputImage, ycrcb, Imgproc.COLOR_BGR2YUV);

            ArrayList<Mat> channels = new ArrayList<Mat>();

            Core.split(ycrcb, channels);

            Mat equalized = new Mat();

            Imgproc.equalizeHist(channels.get(0), equalized);

            channels.set(0, equalized);
            Core.merge(channels, ycrcb);

            Mat result = new Mat();
            Imgproc.cvtColor(ycrcb, result, Imgproc.COLOR_YUV2BGR);

            return result;
        }

        return null;
    }

    private static Mat reduceColor(Mat image, int div) {

        Mat result = new Mat(image.size(), image.type());

        int rows = image.rows(); // number of lines
        int cols = image.cols(); // number of elements per line

        for (int j = 0; j < rows; j++) {

            for (int i = 0; i < cols; i++) {

                double[] data = image.get(j, i);

                for (int k = 0; k < 3; k++) {
                    data[k] = ((int) data[k] / div) * div + div / 2;

                }

                int put = result.put(j, i, data);

            }
        }

        return result;
    }

}
