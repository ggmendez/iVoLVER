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
import org.opencv.core.MatOfInt;
import org.opencv.core.MatOfPoint;
import org.opencv.core.Point;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.highgui.Highgui;
import org.opencv.imgproc.Imgproc;
import org.opencv.imgproc.Moments;
import responses.FindingResponse;

/**
 *
 * @author Gonzalo
 */
public class processScribble extends HttpServlet {

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        try (PrintWriter out = response.getWriter()) {

            String imageForTextRecognition = request.getParameter("imageForTextRecognition") + ".png";

            Mat original = ImageUtils.loadImage(imageForTextRecognition, request);
            Mat image = original.clone();
            Mat mask = Mat.zeros(image.rows() + 2, image.cols() + 2, CvType.CV_8UC1);

            String samplingPoints = request.getParameter("samplingPoints");

            Gson gson = new Gson();
            Point[] userPoints = gson.fromJson(samplingPoints, Point[].class);

            MatOfPoint points = new MatOfPoint(new Mat(userPoints.length, 1, CvType.CV_32SC2));
            int cont = 0;

            for (Point point : userPoints) {
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

            Random random = new Random();
            int b = random.nextInt(256);
            int g = random.nextInt(256);
            int r = random.nextInt(256);
            Scalar newVal = new Scalar(b, g, r);

            FloodFillFacade floodFillFacade = new FloodFillFacade();

            for (int i = 0; i < seeds.size(); i++) {
                Point seed = seeds.get(i);
                image = floodFillFacade.fill(image, mask, (int) seed.x, (int) seed.y, newVal);
            }

            Imgproc.drawContours(image, arrayList, 0, newVal, -1);

            Imgproc.resize(mask, mask, image.size());
                        
            Scalar meanColor = Core.mean(original, mask);

//            Highgui.imwrite("C:\\Users\\Gonzalo\\Documents\\NetBeansProjects\\iVoLVER\\uploads\\the_convexHull.png", image);
            ImageUtils.saveImage(image, imageForTextRecognition + "_the_convexHull.png", request);

            newVal = new Scalar(255, 255, 0);

            floodFillFacade.setMasked(false);
            System.out.println("Last one:");
            floodFillFacade.fill(image, mask, 211, 194, newVal);

            Core.circle(image, new Point(211, 194), 5, new Scalar(0, 0, 0), -1);
            ImageUtils.saveImage(image, imageForTextRecognition + "_final.png", request);
//            Highgui.imwrite("C:\\Users\\Gonzalo\\Documents\\NetBeansProjects\\iVoLVER\\uploads\\final.png", image);

            Mat element = new Mat(3, 3, CvType.CV_8U, new Scalar(1));
            Imgproc.morphologyEx(mask, mask, Imgproc.MORPH_CLOSE, element, new Point(-1, -1), 3);

            Imgproc.resize(mask, mask, image.size());

//            ImageUtils.saveImage(mask, "final_mask_dilated.png", request);
//            Highgui.imwrite("C:\\Users\\Gonzalo\\Documents\\NetBeansProjects\\iVoLVER\\uploads\\final_mask_dilated.png", mask);

            List<MatOfPoint> contours = new ArrayList<MatOfPoint>();
            Imgproc.findContours(mask.clone(), contours, new Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_NONE);
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

            Rect computedSearchWindow = Imgproc.boundingRect(biggestContour);
            Point massCenter = computedSearchWindow.tl();

            FindingResponse findingResponse = new FindingResponse(path, meanColor, massCenter, -1, contourArea);
            String jsonResponse = gson.toJson(findingResponse, FindingResponse.class);

            out.println(jsonResponse);

//            String jsonResponse = gson.toJson(path);
//            out.println(jsonResponse);
        }
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
