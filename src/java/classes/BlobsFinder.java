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
import org.omg.CORBA.MARSHAL;
import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.MatOfPoint;
import org.opencv.core.Point;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.core.Size;
import org.opencv.highgui.Highgui;
import org.opencv.imgproc.Imgproc;
import org.opencv.imgproc.Moments;

/**
 *
 * @author ggmendez
 */
public class BlobsFinder {

    
    private Mat image = null;
    private String outImageName;
    private final ArrayList<MatOfPoint> validContours = new ArrayList<MatOfPoint>();
    private final ArrayList<String> contourPaths = new ArrayList<String>();
    private final ArrayList<Point> topLeftCorners = new ArrayList<Point>();
    private final ArrayList<Double> contoursAreas = new ArrayList<Double>();
    private HttpServletRequest request = null;
    

    private static int MIN_AREA = 800;

    public BlobsFinder(Mat image, String outImageName, HttpServletRequest request) {
        this.image = image;
        this.outImageName = outImageName;
        this.request = request;
    }

    public void findBlobContours() {
        
        Mat grayImage = new Mat();
        Imgproc.cvtColor(image, grayImage, Imgproc.COLOR_BGR2GRAY);
        ImageUtils.saveImage(grayImage, outImageName + "_grayImage.png", request);

        Mat gaussianImage = new Mat();
        Imgproc.GaussianBlur(grayImage, gaussianImage, new Size(0, 0), 3);
        Core.addWeighted(grayImage, 1.5, gaussianImage, -1, 0, gaussianImage);
        ImageUtils.saveImage(gaussianImage, outImageName + "_gaussianGrayImage.png", request);

        Mat binaryImage = new Mat();
        Imgproc.adaptiveThreshold(gaussianImage, binaryImage, 255, Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C, Imgproc.THRESH_BINARY_INV, 15, 4);
        ImageUtils.saveImage(binaryImage, outImageName + "_binaryImage.png", request);

        Mat erodedImage = new Mat();

        binaryImage.copyTo(erodedImage);

        Mat structuringElement = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, new Size(3, 3));
        Point anchor = new Point(-1, -1);

        Imgproc.morphologyEx(erodedImage, erodedImage, Imgproc.MORPH_CLOSE, structuringElement, anchor, 1);
        ImageUtils.saveImage(erodedImage, outImageName + "_erodedImage.png", request);

        List<MatOfPoint> contours = new ArrayList<MatOfPoint>();
        
        Imgproc.findContours(erodedImage, contours, new Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_SIMPLE);

        Mat originalContoursImage = new Mat(image.size(), CvType.CV_8UC1, new Scalar(0));
        Scalar contourColor = new Scalar(255);
        int thickness = -1; // Thicknes should be lower than zero in order to drawn the filled contours
        Imgproc.drawContours(originalContoursImage, contours, -1, contourColor, thickness); // Drawing all the contours found
        ImageUtils.saveImage(originalContoursImage, outImageName + "_originalContoursImage.png", request);
        
        
        Mat erodedContoursImage = new Mat();
        Imgproc.erode(originalContoursImage, erodedContoursImage, structuringElement, anchor, 1);
        ImageUtils.saveImage(erodedContoursImage, outImageName + "_erodedContoursImage.png", request);

        ArrayList<MatOfPoint> finalContours = new ArrayList<MatOfPoint>();
        Mat finalContourImage = new Mat(image.size(), CvType.CV_8UC1, new Scalar(0));        
        Imgproc.findContours(erodedContoursImage, finalContours, new Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_SIMPLE);        

        for (int i = 0; i < finalContours.size(); i++) {
            MatOfPoint currentContour = finalContours.get(i);
            double area = Imgproc.contourArea(currentContour);
            if (area > MIN_AREA) {

                validContours.add(currentContour);            
               
                String fabricPath = generateFabricPathString(currentContour);
                contourPaths.add(fabricPath);
                
                Rect boundingRect = Imgproc.boundingRect(currentContour);
                topLeftCorners.add(boundingRect.tl());

                contoursAreas.add(area);
            }
        }

        // Drawing ALL the valid contours
        Imgproc.drawContours(finalContourImage, validContours, -1, contourColor, thickness);
        ImageUtils.saveImage(finalContourImage, outImageName + "_finalContourImage.png", request);

    }

    private String generateFabricPathString(MatOfPoint contour) {
        Point[] points = contour.toArray();
        String path = "M " + (int) points[0].x + " " + (int) points[0].y + " ";
        for (int j = 1; j < points.length; ++j) {
            Point v = points[j];
            path += "L " + (int) v.x + " " + (int) v.y + " ";
        }
        path += "Z";
        return path;
    }

    public Mat getImage() {
        return image;
    }

    public void setImage(Mat image) {
        this.image = image;
    }

    public ArrayList<MatOfPoint> getValidContours() {
        return validContours;
    }

    public String getOutImageName() {
        return outImageName;
    }

    public void setOutImageName(String outImageName) {
        this.outImageName = outImageName;
    }

    public ArrayList<String> getContourPaths() {
        return contourPaths;
    }

    public ArrayList<Point> getTopLeftCorners() {
        return topLeftCorners;
    }    

    public ArrayList<Double> getContoursAreas() {
        return contoursAreas;
    }    

}
