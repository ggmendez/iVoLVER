/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package servlets;

import classes.ContourComparator;
import classes.FloodFillFacade;
import classes.ImageUtils;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.MatOfPoint;
import org.opencv.core.Point;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.highgui.Highgui;
import org.opencv.imgproc.Imgproc;
import responses.FindingResponse;

/**
 *
 * @author Gonzalo
 */
public class FillAreaByScribble extends HttpServlet {

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        try (PrintWriter out = response.getWriter()) {

            String imageForTextRecognition = request.getParameter("imageForTextRecognition") + ".png";
            String isSingleRegion = request.getParameter("isSingleRegion");
            boolean makeSingleRegion = isSingleRegion.toLowerCase().equals("true");

            Mat original = ImageUtils.loadImage(imageForTextRecognition, request);
            Mat image = original.clone();
            Mat mask = Mat.zeros(image.rows() + 2, image.cols() + 2, CvType.CV_8UC1);

            String samplingPoints = request.getParameter("samplingPoints");

            Gson gson = new Gson();
            Point[] tmpPoints = gson.fromJson(samplingPoints, Point[].class);

            ArrayList<Point> userPoints = new ArrayList<Point>(Arrays.asList(tmpPoints));

            Mat userPointsImage = image.clone();

            ArrayList<Mat> maskRegions = new ArrayList<>();

            Random random = new Random();
            int b = random.nextInt(256);
            int g = random.nextInt(256);
            int r = random.nextInt(256);
            Scalar newVal = new Scalar(b, g, r);
            FloodFillFacade floodFillFacade = new FloodFillFacade();

            int k = 0;

            for (int i = 0; i < userPoints.size(); i++) {
                Point point = userPoints.get(i);

                image = floodFillFacade.fill(image, mask, (int) point.x, (int) point.y, newVal);

                Mat seedImage = original.clone();
                Core.circle(seedImage, point, 9, new Scalar(0, 0, 255), -1);
                Core.putText(userPointsImage, "" + k, new Point(point.x + 5, point.y + 5), 3, 0.5, new Scalar(0, 0, 0));
//                ImageUtils.saveImage(seedImage, "mask_" + k + "_seed" + imageForTextRecognition + ".png", request);

                if (!makeSingleRegion) {
                    Mat element = new Mat(3, 3, CvType.CV_8U, new Scalar(1));
                    Imgproc.morphologyEx(mask, mask, Imgproc.MORPH_CLOSE, element, new Point(-1, -1), 3);
                    Imgproc.resize(mask, mask, original.size());
                }

//                ImageUtils.saveImage(mask, "mask_" + k + "" + imageForTextRecognition + ".png", request);

                Mat dilatedMask = new Mat();

                int elementSide = 21;
                Mat element = new Mat(elementSide, elementSide, CvType.CV_8U, new Scalar(1));
                Imgproc.morphologyEx(mask, dilatedMask, Imgproc.MORPH_DILATE, element, new Point(-1, -1), 1);
                Imgproc.resize(dilatedMask, dilatedMask, original.size());

//                ImageUtils.saveImage(dilatedMask, "mask_" + k + "_dilated" + imageForTextRecognition + ".png", request);

                maskRegions.add(mask);

                if (!makeSingleRegion) {
                    int totalRemovedPoints = filterPoints(userPoints, dilatedMask);
                    if (totalRemovedPoints > 0) {
                        i = -1; // so that the algorithm starts again at the first element of the userPoints array
                    }
                } else {
                    filterPoints(userPoints, mask);
                }

//                System.out.println("Total points after filtering:");
//                System.out.println(userPoints.size());

                if (!makeSingleRegion) {
                    mask = Mat.zeros(original.rows() + 2, original.cols() + 2, CvType.CV_8UC1);
                }

                k++;
            }

            ArrayList<FindingResponse> findingResponses = new ArrayList<>();

            if (makeSingleRegion) {

                Mat element = new Mat(3, 3, CvType.CV_8U, new Scalar(1));
                Imgproc.morphologyEx(mask, mask, Imgproc.MORPH_CLOSE, element, new Point(-1, -1), 3);
                
                Imgproc.resize(mask, mask, image.size());

                List<MatOfPoint> contours = new ArrayList<MatOfPoint>();
                Imgproc.findContours(mask.clone(), contours, new Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_NONE);

                MatOfPoint biggestContour = contours.get(0); // getting the biggest contour
                double contourArea = Imgproc.contourArea(biggestContour);

                if (contours.size() > 1) {
                    biggestContour = Collections.max(contours, new ContourComparator()); // getting the biggest contour in case there are more than one
                }

                Point[] biggestContourPoints = biggestContour.toArray();
                String path = "M " + (int) biggestContourPoints[0].x + " " + (int) biggestContourPoints[0].y + " ";
                for (int i = 1; i < biggestContourPoints.length; ++i) {
                    Point v = biggestContourPoints[i];
                    path += "L " + (int) v.x + " " + (int) v.y + " ";
                }
                path += "Z";

//                System.out.println("path:");
//                System.out.println(path);

                Rect computedSearchWindow = Imgproc.boundingRect(biggestContour);
                Point massCenter = computedSearchWindow.tl();

                Scalar meanColor = Core.mean(original, mask);
                
//                ImageUtils.saveImage(mask, "single_mask_" + imageForTextRecognition + ".png", request);

                FindingResponse findingResponse = new FindingResponse(path, meanColor, massCenter, -1, contourArea);
                findingResponses.add(findingResponse);

            } else {

                float imageArea = image.cols() * image.rows();

                for (int j = 0; j < maskRegions.size(); j++) {
                    Mat region = maskRegions.get(j);

                    List<MatOfPoint> contours = new ArrayList<MatOfPoint>();
                    Imgproc.findContours(region.clone(), contours, new Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_NONE);

                    MatOfPoint biggestContour = contours.get(0); // getting the biggest contour

                    if (contours.size() > 1) {
                        biggestContour = Collections.max(contours, new ContourComparator()); // getting the biggest contour in case there are more than one
                    }

                    double contourArea = Imgproc.contourArea(biggestContour);

                    if (contourArea / imageArea < 0.8) { // only areas less than 80% of that of the image are accepted

                        Point[] biggestContourPoints = biggestContour.toArray();
                        String path = "M " + (int) biggestContourPoints[0].x + " " + (int) biggestContourPoints[0].y + " ";
                        for (int i = 1; i < biggestContourPoints.length; ++i) {
                            Point v = biggestContourPoints[i];
                            path += "L " + (int) v.x + " " + (int) v.y + " ";
                        }
                        path += "Z";

                        Rect computedSearchWindow = Imgproc.boundingRect(biggestContour);
                        Point massCenter = computedSearchWindow.tl();

//                        System.out.println("Contour area: " + contourArea);

                        Mat contoursImage = userPointsImage.clone();
                        Imgproc.drawContours(contoursImage, contours, 0, newVal, 1);

                        Scalar meanColor = Core.mean(original, region);

                        FindingResponse findingResponse = new FindingResponse(path, meanColor, massCenter, -1, contourArea);
                        findingResponses.add(findingResponse);

//                        ImageUtils.saveImage(contoursImage, "mask_" + j + "_contourned" + imageForTextRecognition + ".png", request);

                    }

                }

            }

            String jsonResponse = gson.toJson(findingResponses, ArrayList.class);

            out.println(jsonResponse);

        }
    }

    public static int filterPoints(ArrayList<Point> points, Mat mask) {
        int removals = 0;
        for (int i = 0; i < points.size(); i++) {
            Point point = points.get(i);
            int col = (int) point.x;
            int row = (int) point.y;
            double[] value = mask.get(row, col);
            if (value[0] != 0) {
//                System.out.println("Removing");
                points.remove(point);
                i--;
                removals++;
            }
        }
        return removals;
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
