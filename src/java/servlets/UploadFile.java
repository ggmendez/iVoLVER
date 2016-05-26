// C:/Program Files (x86)/Apache Software Foundation/Tomcat 6.0
// C:/Program Files (x86)/Apache Software Foundation/Tomcat 8.0


/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package servlets;

import classes.ImageUtils;
import classes.OpenCVLoader;
import static classes.OpenCVLoader.getProjectFolderPath;
import com.recognition.software.jdeskew.ImageUtil;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.util.Iterator;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.tomcat.util.codec.binary.Base64;

/**
 *
 * @author ggm
 */
public class UploadFile extends HttpServlet {

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
        PrintWriter out = response.getWriter();
        try {

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
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

//        String currentPath = getServletContext().getResource("/").getPath();
//        File dir = new File(currentPath);
//        String dirName = dir.getParentFile().getParentFile().getAbsolutePath();
//        String path = dirName + "/uploads";
        
//        String contextPath = request.getContextPath();
//        String projectFolderPath = getProjectFolderPath(contextPath);
//        String savingPath = projectFolderPath + OpenCVLoader.fileSeparator + OpenCVLoader.imagesFolder;
        
        String savingPath = ImageUtils.getImageSavingDirectory(request);
        
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
                        
                        if (value.contains("data:image/png;base64,")) {
                            value = value.substring("data:image/png;base64,".length());
                        } else if (value.contains("data:image/svg+xml;base64,")) {
                            value = value.substring("data:image/svg+xml;base64,".length());
                        } else if (value.contains("data:image/jpeg;base64,")) {
                            value = value.substring("data:image/jpeg;base64,".length());
                        } else if (value.contains("data:image/gif;base64,")) {
                            value = value.substring("data:image/gif;base64,".length());
                        } 

                        

                        byte[] contentData = value.getBytes();
                        byte[] decodedData = Base64.decodeBase64(contentData);
                                                
                        String fileName = savingPath + "/" + name + ".png";
                        
                        FileOutputStream fos = new FileOutputStream(fileName);
                        fos.write(decodedData);
                        fos.flush();
                        fos.close();
                        
                        
//                        String rects = classes.FaceDetector.detectFace(fileName);
                        
//                        out.println(rects + " faces detected!!!");
                        
//                        out.write(rects);
                        
                        out.write("Image imported");
                        

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
