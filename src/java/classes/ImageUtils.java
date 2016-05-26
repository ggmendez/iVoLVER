/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package classes;

import static classes.OpenCVLoader.getProjectFolderPath;
import java.io.File;
import javax.servlet.http.HttpServletRequest;
import org.opencv.core.Mat;
import org.opencv.highgui.Highgui;

/**
 *
 * @author ggmendez
 */
public class ImageUtils {

//    public static String savingDirectory = "/Users/ggmendez/Development/iVoLVER/uploads";
//    public static String savingDirectory = "C:/Users/Gonzalo/Documents/NetBeansProjects/iVoLVER/uploads";
    public static Mat loadImage(String imageFileName, HttpServletRequest request) {
        File path = new File(ImageUtils.getImageSavingDirectory(request));
        String fileName = path + "/" + imageFileName;
//        System.out.println("Trying to load image from file: " + fileName);
        Mat image = Highgui.imread(fileName);
        return image;
    }

    public static String saveImage(Mat image, String imageFileName, HttpServletRequest request) {
        File path = new File(ImageUtils.getImageSavingDirectory(request));
        String fileName = path + "/" + imageFileName;
        Highgui.imwrite(fileName, image);
        return fileName;
    }

    public static String getImageSavingDirectory(HttpServletRequest request) {
        String contextPath = request.getContextPath();
        String projectFolderPath = getProjectFolderPath(contextPath);
        String savingPath = projectFolderPath + OpenCVLoader.fileSeparator + OpenCVLoader.imagesFolder;
        return savingPath;
    }

}
