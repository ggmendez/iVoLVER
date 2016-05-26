/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package classes;

import static classes.ImageUtils.saveImage;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import org.opencv.core.Core;
import org.opencv.core.CvType;

import org.opencv.core.Mat;
import org.opencv.core.MatOfInt;
import org.opencv.core.MatOfPoint;
import org.opencv.core.Point;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.highgui.Highgui;
import org.opencv.imgproc.Imgproc;

public class FloodFillFacade {

    public static final int NULL_RANGE = 0;
    public static final int FIXED_RANGE = 1;
    public static final int FLOATING_RANGE = 2;
    private boolean colored = true;
    private boolean masked = true;
    private int range = FIXED_RANGE;

    private int connectivity = 4;
    private int newMaskVal = 255;
    private int lowerDiff = 20;
    private int upperDiff = 20;

    public static int cont = 0;

    /*static {
        System.load("C:/Users/Gonzalo/Documents/NetBeansProjects/iVoLVER/lib/opencv_java249_64.dll");
    }

    public static void main(String[] args) {

        Random random = new Random();
        int b = random.nextInt(256);
        int g = random.nextInt(256);
        int r = random.nextInt(256);
        Scalar newVal = new Scalar(b, g, r);

        Mat original = Highgui.imread("C:\\Users\\Gonzalo\\Documents\\NetBeansProjects\\iVoLVER\\uploads\\image.png");
        Mat image = original.clone();

        Mat mask = Mat.zeros(image.rows() + 2, image.cols() + 2, CvType.CV_8UC1);

        ArrayList<Point> userPoints = new ArrayList<>();
        userPoints.add(new Point(154, 243));
        userPoints.add(new Point(168, 216));
        userPoints.add(new Point(182, 190));
        userPoints.add(new Point(198, 164));
        userPoints.add(new Point(214, 139));
        userPoints.add(new Point(231, 114));
        userPoints.add(new Point(251, 92));
        userPoints.add(new Point(256, 92));
        userPoints.add(new Point(241, 118));
        userPoints.add(new Point(226, 145));
        userPoints.add(new Point(212, 171));
        userPoints.add(new Point(199, 198));
        userPoints.add(new Point(193, 219));
        userPoints.add(new Point(213, 197));
        userPoints.add(new Point(232, 174));
        userPoints.add(new Point(252, 151));
        userPoints.add(new Point(241, 169));
        userPoints.add(new Point(225, 194));
        userPoints.add(new Point(215, 217));
        userPoints.add(new Point(238, 198));
        userPoints.add(new Point(250, 196));
        userPoints.add(new Point(235, 223));
        userPoints.add(new Point(245, 225));

        // Convex hull computation
        int cont = 0;
        MatOfPoint points = new MatOfPoint(new Mat(userPoints.size(), 1, CvType.CV_32SC2));

        for (int i = 0; i < userPoints.size(); i++) {
            Point point = userPoints.get(i);
            int y = (int) point.y;
            int x = (int) point.x;

            int[] data = {x, y};
            points.put(cont++, 0, data);
        }

        MatOfInt hull = new MatOfInt();
        Imgproc.convexHull(points, hull);

        MatOfPoint mopOut = new MatOfPoint();
        mopOut.create((int) hull.size().height, 1, CvType.CV_32SC2);

        int totalPoints = (int) hull.size().height;

        Point[] convexHullPoints = new Point[totalPoints];
        ArrayList<Point> seeds = new ArrayList<>();

        for (int i = 0; i < totalPoints; i++) {
            int index = (int) hull.get(i, 0)[0];
            double[] point = new double[]{
                points.get(index, 0)[0], points.get(index, 0)[1]
            };
            mopOut.put(i, 0, point);

            convexHullPoints[i] = new Point(point[0], point[1]);
            seeds.add(new Point(point[0], point[1]));

        }

        MatOfPoint mop = new MatOfPoint();
        mop.fromArray(convexHullPoints);

        ArrayList<MatOfPoint> arrayList = new ArrayList<MatOfPoint>();
        arrayList.add(mop);

        FloodFillFacade floodFillFacade = new FloodFillFacade();

        for (int i = 0; i < seeds.size(); i++) {
            Point seed = seeds.get(i);
            image = floodFillFacade.fill(image, mask, (int) seed.x, (int) seed.y, newVal);
        }

        Imgproc.drawContours(image, arrayList, 0, newVal, -1);

//        Highgui.imwrite("C:\\Users\\Gonzalo\\Documents\\NetBeansProjects\\iVoLVER\\uploads\\the_convexHull.png", image);

        newVal = new Scalar(255, 255, 0);

        floodFillFacade.setMasked(false);
        System.out.println("Last one:");
        floodFillFacade.fill(image, mask, 211, 194, newVal);

        Core.circle(image, new Point(211, 194), 5, new Scalar(0, 0, 0), -1);
//        Highgui.imwrite("C:\\Users\\Gonzalo\\Documents\\NetBeansProjects\\iVoLVER\\uploads\\final.png", image);

        Mat element = new Mat(3, 3, CvType.CV_8U, new Scalar(1));
        Imgproc.morphologyEx(mask, mask, Imgproc.MORPH_CLOSE, element, new Point(-1, -1), 3);

//        Highgui.imwrite("C:\\Users\\Gonzalo\\Documents\\NetBeansProjects\\iVoLVER\\uploads\\final_mask_dilated.png", mask);

        List<MatOfPoint> contours = new ArrayList<MatOfPoint>();
        Imgproc.findContours(mask.clone(), contours, new Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_NONE);
        Mat contoursImage = new Mat(image.size(), CvType.CV_8UC3);
        double contourArea = 0;
        String path = "";

        MatOfPoint biggestContour = contours.get(0); // getting the biggest contour
        contourArea = Imgproc.contourArea(biggestContour);

        if (contours.size() > 1) {
            biggestContour = Collections.max(contours, new ContourComparator()); // getting the biggest contour in case there are more than one
        }

        Point[] biggestContourPoints = biggestContour.toArray();
        path = "M " + (int) biggestContourPoints[0].x + " " + (int) biggestContourPoints[0].y + " ";
        for (int i = 1; i < biggestContourPoints.length; ++i) {
            Point v = biggestContourPoints[i];
            path += "L " + (int) v.x + " " + (int) v.y + " ";
        }
        path += "Z";
        
        System.out.println("path:");
        System.out.println(path);

    }*/

    @Override
    public String toString() {
        return "FloodFillFacade [colored=" + colored + ", masked=" + masked
                + ", range=" + range + ", connectivity="
                + connectivity + ", newMaskVal=" + newMaskVal + ", lowerDiff="
                + lowerDiff + ", upperDiff=" + upperDiff + "]";
    }

    public Mat fill(Mat image, Mat mask, int x, int y, Scalar newVal) {

        Point seedPoint = new Point(x, y);

        Rect rect = new Rect();

//        Scalar newVal = isColored() ? new Scalar(b, g, r) : new Scalar(r * 0.299 + g * 0.587 + b * 0.114);
        Scalar lowerDifference = new Scalar(lowerDiff, lowerDiff, lowerDiff);
        Scalar upperDifference = new Scalar(upperDiff, upperDiff, upperDiff);
        if (range == NULL_RANGE) {
            lowerDifference = new Scalar(0,0,0);
            upperDifference = new Scalar(0,0,0);
        }
        int flags = connectivity + (newMaskVal << 8) + ((range == FIXED_RANGE ? Imgproc.FLOODFILL_FIXED_RANGE : 0) | 0);//Imgproc.FLOODFILL_MASK_ONLY);
        int area = 0;
        if (masked) {
            area = Imgproc.floodFill(image, mask, seedPoint, newVal, rect, lowerDifference, upperDifference, flags);
        } else {
            area = Imgproc.floodFill(image, new Mat(), seedPoint, newVal, rect, lowerDifference, upperDifference, flags);
        }

//        Highgui.imwrite("C:\\Users\\Gonzalo\\Documents\\NetBeansProjects\\iVoLVER\\uploads\\image_after_flood_" + cont + ".png", image);
//        Highgui.imwrite("C:\\Users\\Gonzalo\\Documents\\NetBeansProjects\\iVoLVER\\uploads\\mask_" + cont + ".png", mask);

//        System.out.println("area: " + area);

        cont++;

        return image;

    }

    public int getConnectivity() {
        return connectivity;
    }

    public void setConnectivity(int connectivity) {
        this.connectivity = connectivity;
    }

    public boolean isColored() {
        return colored;
    }

    public void setColored(boolean colored) {
        this.colored = colored;
    }

    public boolean isMasked() {
        return masked;
    }

    public void setMasked(boolean masked) {
        this.masked = masked;
    }

    public int getRange() {
        return range;
    }

    public void setRange(int range) {
        this.range = range;
    }

    public int getLowerDiff() {
        return lowerDiff;
    }

    public void setLowerDiff(int lowerDiff) {
        this.lowerDiff = lowerDiff;
    }

    public int getUpperDiff() {
        return upperDiff;
    }

    public void setUpperDiff(int upperDiff) {
        this.upperDiff = upperDiff;
    }

}
