/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package servlets;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Iterator;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.tomcat.util.codec.binary.Base64;

/**
 *
 * @author ggmendez
 */
public class SaveFileInServer extends HttpServlet {

   /**
    * Processes requests for both HTTP <code>GET</code> and
    * <code>POST</code> methods.
    *
    * @param request servlet request
    * @param response servlet response
    * @throws ServletException if a servlet-specific error
    * occurs
    * @throws IOException if an I/O error occurs
    */
   protected void processRequest(HttpServletRequest request, HttpServletResponse response)
           throws ServletException, IOException {
      response.setContentType("text/html;charset=UTF-8");
      try (PrintWriter out = response.getWriter()) {
         /* TODO output your page here. You may use following sample code. */
         out.println("<!DOCTYPE html>");
         out.println("<html>");
         out.println("<head>");
         out.println("<title>Servlet SaveFileInServer</title>");         
         out.println("</head>");
         out.println("<body>");
         out.println("<h1>Servlet SaveFileInServer at " + request.getContextPath() + "</h1>");
         out.println("</body>");
         out.println("</html>");
      }
   }

   // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
   /**
    * Handles the HTTP <code>GET</code> method.
    *
    * @param request servlet request
    * @param response servlet response
    * @throws ServletException if a servlet-specific error
    * occurs
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
    * @throws ServletException if a servlet-specific error
    * occurs
    * @throws IOException if an I/O error occurs
    */
   @Override
   protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        String currentPath = getServletContext().getResource("/").getPath();
        File dir = new File(currentPath);
        String dirName = dir.getParentFile().getParentFile().getAbsolutePath();
        
        
        
        String path = dirName + "/SVGs";
        
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        boolean isMultipart = ServletFileUpload.isMultipartContent(request);

        if (isMultipart) {
            // Create a factory for disk-based file items
            FileItemFactory factory = new DiskFileItemFactory();

            // Create a new file upload handler
            ServletFileUpload upload = new ServletFileUpload(factory);

            try {
                // Parse the request
                List<FileItem> items = upload.parseRequest(request);

                Iterator<FileItem> iterator = items.iterator();

                while (iterator.hasNext()) {

                    FileItem item = iterator.next();

                    if (item.isFormField()) {

                        String name = item.getFieldName();
                        String value = item.getString();
                        
                        System.out.println("value:");
                        System.out.println(value);
                        
                        

                        byte[] contentData = value.getBytes();
                        
                        
                        
                                           
                        
                                                
                        String fileName = path + "/" + name + ".svg";
                        
                        System.out.println("fileName:");
                        System.out.println(fileName);
                        
                        FileOutputStream fos = new FileOutputStream(fileName);
                        fos.write(contentData);
                        fos.flush();
                        fos.close();
                        
                        out.write("../SVGs/" + name + ".svg");
                        

                    }
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

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
