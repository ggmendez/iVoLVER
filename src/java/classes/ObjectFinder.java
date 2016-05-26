/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package classes;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import javax.imageio.ImageIO;
import javax.swing.ImageIcon;
import javax.swing.JFrame;
import javax.swing.JLabel;
import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.MatOfByte;
import org.opencv.core.MatOfFloat;
import org.opencv.core.MatOfInt;
import org.opencv.core.MatOfPoint;
import org.opencv.core.Point;
import org.opencv.core.Rect;
import org.opencv.core.RotatedRect;
import org.opencv.core.Scalar;
import org.opencv.core.Size;
import org.opencv.core.TermCriteria;
import org.opencv.highgui.Highgui;
import org.opencv.imgproc.Imgproc;
import org.opencv.imgproc.Moments;
import org.opencv.video.Video;

/**
 *
 * @author ggmendez
 */
public class ObjectFinder {

    private Mat objectImage = null;
    private Mat objectHistogram = null;
    private Mat inputFrame = null;
    private ArrayList<Integer> thresholdsVector;
    private Mat backprojectionImage = new Mat();
    private Mat thresholdedBackprojection = new Mat();
    private Mat contoursImage = null;
    private Mat morphologicalImage = new Mat();
    private Rect computedSearchWindow = null;
    private RotatedRect trackBox = null;
    private Point massCenter = null;
    private Point topLeftCorner = null;
    private String objectName = null;
    private MatOfPoint firstContour = null;
    private Scalar meanColor = null;
    
    public ObjectFinder(Mat objectImage, ArrayList<Integer> thresholdsVector) {
        this.objectImage = objectImage;
        
        Highgui.imwrite("objectImage.png", objectImage);
        
        this.thresholdsVector = thresholdsVector;
        this.objectHistogram = new Mat();
        this.meanColor = Core.mean(objectImage);
        computeObjectHistogram();
    }

    public ObjectFinder(Mat objectImage, ArrayList<Integer> thresholdsVector, String objectName) {
        this.objectImage = objectImage;
        this.thresholdsVector = thresholdsVector;
        this.objectName = objectName;
        this.objectHistogram = new Mat();
        computeObjectHistogram();
    }

    public String find(Mat input) {

        inputFrame = input.clone();

        backprojectObjectHistogram();

        computeThresholdedBackProjection();

        applyMorphologicalFilters();

        computeSearchWindow();

        computeTrackBox();

        String path = "";

        if (firstContour != null) {
            Point[] points = firstContour.toArray();
            path = "M " + (int) points[0].x + " " + (int) points[0].y + " ";
            for (int i = 1; i < points.length; ++i) {
                Point point = points[i];
                path += "L " + (int) point.x + " " + (int) point.y + " ";
            }
            path += "Z";

        }
        
        return path;

    }

    public void find(Mat input, Mat output) {

        inputFrame = input.clone();

        backprojectObjectHistogram();

        computeThresholdedBackProjection();

        applyMorphologicalFilters();

        computeSearchWindow();

        computeTrackBox();

        drawOutput(output);

    }

    private void computeObjectHistogram() {
        // Converting the current fram to HSV color space
        Mat hsvImage = new Mat(this.objectImage.size(), CvType.CV_8UC3);

        System.out.println(this.objectImage);

        Imgproc.cvtColor(this.objectImage, hsvImage, Imgproc.COLOR_BGR2HSV);

        // Getting the pixels that are in te specified ranges
        Mat maskImage = new Mat(this.objectImage.size(), CvType.CV_8UC1);
        int hmin = thresholdsVector.get(0);
        int hmax = thresholdsVector.get(1);
        int smin = thresholdsVector.get(2);
        int smax = thresholdsVector.get(3);
        int vmin = thresholdsVector.get(4);
        int vmax = thresholdsVector.get(5);

        Core.inRange(hsvImage, new Scalar(hmin, smin, vmin), new Scalar(hmax, smax, vmax), maskImage);

        Mat hueImage = new Mat(hsvImage.size(), CvType.CV_8UC1);

        MatOfInt fromto = new MatOfInt(0, 0);
        Core.mixChannels(Arrays.asList(hsvImage), Arrays.asList(hueImage), fromto);

        MatOfInt sizes = new MatOfInt(16);
        MatOfFloat ranges = new MatOfFloat(0, 180);
        MatOfInt channels = new MatOfInt(0);

        Mat histogram = new Mat();
        boolean accumulate = false;
        Imgproc.calcHist(Arrays.asList(hueImage), channels, maskImage, histogram, sizes, ranges, accumulate);

        Highgui.imwrite("histogram.png", histogram);

        // The resulting histogram is normalized and placed in the class variable
        Core.normalize(histogram, objectHistogram, 0, 255, Core.NORM_MINMAX);

    }

    private void backprojectObjectHistogram() {

        // Converting the current fram to HSV color space
        Mat hsvImage = new Mat(this.objectImage.size(), CvType.CV_8UC3);

        Imgproc.cvtColor(this.inputFrame, hsvImage, Imgproc.COLOR_BGR2HSV);

        // Getting the pixels that are in te specified ranges    
        int hmin = this.thresholdsVector.get(0);
        int hmax = this.thresholdsVector.get(1);
        int smin = this.thresholdsVector.get(2);
        int smax = this.thresholdsVector.get(3);
        int vmin = this.thresholdsVector.get(4);
        int vmax = this.thresholdsVector.get(5);

        Mat maskImage = new Mat(this.objectImage.size(), CvType.CV_8UC1);
        Core.inRange(hsvImage, new Scalar(hmin, smin, vmin), new Scalar(hmax, smax, vmax), maskImage);

        // Taking the hue channel of the image
        Mat hueImage = new Mat(hsvImage.size(), hsvImage.depth());

        MatOfInt fromto = new MatOfInt(0, 0);
        Core.mixChannels(Arrays.asList(hsvImage), Arrays.asList(hueImage), fromto);

        // Backprojecting the histogram over that hue channel image
        MatOfFloat ranges = new MatOfFloat(0, 180);
        MatOfInt channels = new MatOfInt(0);

        Imgproc.calcBackProject(Arrays.asList(hueImage), channels, this.objectHistogram, this.backprojectionImage, ranges, 1);

        Core.bitwise_and(backprojectionImage, maskImage, backprojectionImage);

    }

    private void computeThresholdedBackProjection() {
        Imgproc.threshold(this.backprojectionImage, this.thresholdedBackprojection, 100, 255, Imgproc.THRESH_BINARY);
    }

    private void applyMorphologicalFilters() {
        Mat element = new Mat(3, 3, CvType.CV_8U, new Scalar(1));
        Imgproc.erode(thresholdedBackprojection, morphologicalImage, element);
        Imgproc.morphologyEx(morphologicalImage, morphologicalImage, Imgproc.MORPH_CLOSE, element, new Point(-1, -1), 2);
        Imgproc.morphologyEx(morphologicalImage, morphologicalImage, Imgproc.MORPH_OPEN, element, new Point(-1, -1), 2);
    }

    private void computeSearchWindow() {

        List<MatOfPoint> contours = new ArrayList<MatOfPoint>();

        // a vector of contours
        // retrieve the external contours
        // all pixels of each contours    
        Imgproc.findContours(this.morphologicalImage.clone(), contours, new Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_NONE);

        // Draw black contours on a white image
        this.contoursImage = new Mat(morphologicalImage.size(), CvType.CV_8U, new Scalar(255));

        if (contours.size() > 1) {

            int minContourWith = 20;
            int minContourHeight = 20;
            int maxContourWith = 6400 / 2;
            int maxContourHeight = 4800 / 2;

            contours = filterContours(contours, minContourWith, minContourHeight, maxContourWith, maxContourHeight);
        }

        if (contours.size() > 1) {
            Collections.sort(contours, new ContourComparator()); // Sorttig the contours to take ONLY the bigger one
        }

        computedSearchWindow = new Rect();
        massCenter = new Point(-1, -1);

        if (contours.size() > 0) {

            this.firstContour = contours.get(0);

            Mat contournedImage = this.firstContour;

            // draw all contours in black with a thickness of 2
            Scalar color = new Scalar(0);
            int thickness = 2;
            Imgproc.drawContours(contoursImage, contours, 0, color, thickness); //

            // testing the bounding box
            computedSearchWindow = Imgproc.boundingRect(this.firstContour);
            
            topLeftCorner = computedSearchWindow.tl();

            // compute all moments
            Moments mom = Imgproc.moments(contournedImage);

            massCenter = new Point(mom.get_m10() / mom.get_m00(), mom.get_m01() / mom.get_m00());

            // draw black dot
            Core.circle(contoursImage, massCenter, 4, color, 8);
        }
    }

    private void computeTrackBox() {

        trackBox = new RotatedRect();

        if (computedSearchWindow.size().width > 0 && computedSearchWindow.size().height > 0 && computedSearchWindow.area() > 1) {
            trackBox = Video.CamShift(thresholdedBackprojection, computedSearchWindow, new TermCriteria(2 | 1, 10, 1));
        }

        if (trackBox.size.width > 0 && trackBox.size.height > 0 && trackBox.size.area() > 1) {
            Core.ellipse(inputFrame, trackBox, new Scalar(0, 0, 255), 2);
        }

    }

    private ArrayList<MatOfPoint> filterContours(List<MatOfPoint> contours, int minContourWith, int minContourHeight, int maxContourWith, int maxContourHeight) {
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

    private void drawOutput(Mat output) {

        Point center;

        int fontFace = Core.FONT_HERSHEY_SIMPLEX;
        double fontScale = 0.7;
        int thickness = 1;

        Core.ellipse(output, trackBox, new Scalar(0, 0, 255), 2);

        center = new Point(trackBox.center.x, trackBox.center.y);

        System.out.println("center: " + center);

        Core.circle(output, center, 2, new Scalar(255, 0, 0), 2);

        Core.circle(output, massCenter, 2, new Scalar(0, 255, 0), 2);

        if (this.objectName != null) {
            Core.putText(output, getObjectName(), center, fontFace, fontScale, new Scalar(0, 0, 0), thickness, 8, false);
        }

    }

    public Mat getObjectImage() {
        return objectImage;
    }

    public void setObjectImage(Mat objectImage) {
        this.objectImage = objectImage;
    }

    public Mat getObjectHistogram() {
        return objectHistogram;
    }

    public void setObjectHistogram(Mat objectHistogram) {
        this.objectHistogram = objectHistogram;
    }

    public Mat getInputFrame() {
        return inputFrame;
    }

    public void setInputFrame(Mat inputFrame) {
        this.inputFrame = inputFrame;
    }

    public ArrayList<Integer> getThresholdsVector() {
        return thresholdsVector;
    }

    public void setThresholdsVector(ArrayList<Integer> thresholdsVector) {
        this.thresholdsVector = thresholdsVector;
    }

    public Mat getBackprojectionImage() {
        return backprojectionImage;
    }

    public void setBackprojectionImage(Mat backprojectionImage) {
        this.backprojectionImage = backprojectionImage;
    }

    public Mat getThresholdedBackprojection() {
        return thresholdedBackprojection;
    }

    public void setThresholdedBackprojection(Mat thresholdedBackprojection) {
        this.thresholdedBackprojection = thresholdedBackprojection;
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

    public Rect getComputedSearchWindow() {
        return computedSearchWindow;
    }

    public void setComputedSearchWindow(Rect computedSearchWindow) {
        this.computedSearchWindow = computedSearchWindow;
    }

    public RotatedRect getTrackBox() {
        return trackBox;
    }

    public void setTrackBox(RotatedRect trackBox) {
        this.trackBox = trackBox;
    }

    public Point getMassCenter() {
//        return massCenter;
        return trackBox.center;
    }

    public void setMassCenter(Point massCenter) {
        this.massCenter = massCenter;
    }

    public String getObjectName() {
        return objectName;
    }

    public void setObjectName(String objectName) {
        this.objectName = objectName;
    }

    public MatOfPoint getFirstContour() {
        return firstContour;
    }

    public void setFirstContour(MatOfPoint firstContour) {
        this.firstContour = firstContour;
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

    public static ArrayList<Integer> getDefaultThresholdVector() {
        ArrayList<Integer> thresholdsVector = new ArrayList<Integer>();
        thresholdsVector.add(0);
        thresholdsVector.add(180);
        thresholdsVector.add(65);
        thresholdsVector.add(256);
        thresholdsVector.add(100);
        thresholdsVector.add(256);
        return thresholdsVector;
    }

    public static void imshow(Mat img, String title) {
        MatOfByte matOfByte = new MatOfByte();
        Highgui.imencode(".jpg", img, matOfByte);
        byte[] byteArray = matOfByte.toArray();
        BufferedImage bufImage = null;
        try {
            InputStream in = new ByteArrayInputStream(byteArray);
            bufImage = ImageIO.read(in);
            JFrame frame = new JFrame(title);
            frame.getContentPane().add(new JLabel(new ImageIcon(bufImage)));
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.pack();
            frame.setVisible(true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}