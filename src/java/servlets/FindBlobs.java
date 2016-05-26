/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package servlets;

import responses.BlobFoundResponse;
import classes.BlobsFinder;
import classes.ImageUtils;
import classes.TextExtractor;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.opencv.core.Mat;
import org.opencv.core.MatOfPoint;
import org.opencv.core.Point;
import org.opencv.core.Scalar;
import responses.FindingResponse;

/**
 *
 * @author ggmendez
 */
public class FindBlobs extends HttpServlet {

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
        PrintWriter out = response.getWriter();
        try {
            
            String imageFile = request.getParameter("imageForTextRecognition") + ".png";
            
            Mat image = ImageUtils.loadImage(imageFile, request);
            
            BlobsFinder blobsFinder = new BlobsFinder(image, imageFile, request);
            blobsFinder.findBlobContours();
            
            ArrayList<BlobFoundResponse> results = new ArrayList<>();
            
            ArrayList<String> fabricPaths = blobsFinder.getContourPaths();
            ArrayList<Point> topLeftCorners = blobsFinder.getTopLeftCorners();
            ArrayList<Double> contourAreas = blobsFinder.getContoursAreas();
            for (int i = 0; i < fabricPaths.size(); i++) {                
                String currentFabricPath =  fabricPaths.get(i);
                Point currentTopLeft =  topLeftCorners.get(i);
                Double currentArea = contourAreas.get(i);
                BlobFoundResponse foundBlob = new BlobFoundResponse(currentFabricPath, currentTopLeft, currentArea);
                results.add(foundBlob);
            }
            
            Gson gson = new Gson();
            String jsonResponse = gson.toJson(results);

            out.println(jsonResponse);
            
        } finally {
            out.close();
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
