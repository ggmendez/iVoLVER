/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package servlets;

import classes.ImageUtils;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.opencv.core.Mat;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.opencv.core.Point;

/**
 *
 * @author Gonzalo
 */
public class SampleColorsFromImageObject extends HttpServlet {

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

            Mat image = ImageUtils.loadImage(imageForTextRecognition, request);

            String samplingPoints = request.getParameter("samplingPoints");

            ArrayList<int[]> results = new ArrayList<>();

            Gson gson = new Gson();
            Point[] samplingPositions = gson.fromJson(samplingPoints, Point[].class);
            for (Point point : samplingPositions) {

                int row = (int) point.y;
                int col = (int) point.x;
                int totalCols = image.cols();
                int totalRows = image.rows();
                
                int b = -1;
                int g = -1;
                int r = -1;

                if (row >= 0 && col >= 0 && col < totalCols && row < totalRows) {
                    double[] color = image.get(row, col);
                    b = (int) color[0];
                    g = (int) color[1];
                    r = (int) color[2];
                }

                int[] intColor = {r, g, b};
                results.add(intColor);

                System.out.println("Color at: (" + row + ", " + col + "): " + r + " " + g + " " + b);

            }

            String jsonResponse = gson.toJson(results);

            out.println(jsonResponse);

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
