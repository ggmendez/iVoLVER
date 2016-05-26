/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package servlets;

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
import org.opencv.core.Scalar;
import responses.FindingResponse;

/**
 *
 * @author ggmendez
 */
public class ExtractText extends HttpServlet {

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
            
            String imageForTextRecognition = request.getParameter("imageForTextRecognition") + ".png";
            
            double r = Double.parseDouble(request.getParameter("r"));
            double g = Double.parseDouble(request.getParameter("g"));
            double b = Double.parseDouble(request.getParameter("b"));

            Scalar meanColor = new Scalar(r, g, b);
            
            Mat image = ImageUtils.loadImage(imageForTextRecognition, request);
            
            TextExtractor textExtractor = new TextExtractor(image, imageForTextRecognition, request);
            textExtractor.extractText(meanColor);
            
            ArrayList<String> recognizedStrings = textExtractor.getRecognizedStrings();

            Gson gson = new Gson();
            String jsonResponse = gson.toJson(recognizedStrings);

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
