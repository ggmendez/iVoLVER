/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package classes;

import com.sun.jna.NativeLibrary;
import java.io.File;
import org.opencv.core.Core;

/**
 *
 * @author ggm
 */
public class OpenCVLoader {

    public static String imagesFolder = "uploads";
    public static String webPagesFolder = "urls";        

    private static String operatingSystem = System.getProperty("os.name");
    public static String classLoaderPath = new File(OpenCVLoader.class.getClassLoader().getResource("").getPath()).getPath();
    public static String fileSeparator = System.getProperty("file.separator");

    static {
        
        if (operatingSystem.contains("Linux")) {
            System.load("/usr/local/share/OpenCV/java/libopencv_java249.so");
        } else if (operatingSystem.contains("Windows")) {
            System.load("C:/Users/Gonzalo/Documents/NetBeansProjects/iVoLVER/lib/opencv_java249_64.dll");
        } else if (operatingSystem.contains("Mac OS")) {
            System.load("/Users/ggm/Development/iVoLVER/lib/libopencv_java249.dylib");
        }

    }

    public static String getProjectFolderPath(String contextPath) {
        String[] split = OpenCVLoader.classLoaderPath.split(contextPath.substring(1));
        String projectFolderPath = split[0] + contextPath.substring(1);

        String imagesPath = projectFolderPath + OpenCVLoader.fileSeparator + OpenCVLoader.imagesFolder;
        
        File imagesFolder = new File(imagesPath);
        if (!imagesFolder.exists()) {
            imagesFolder.mkdir();
        }
        
        String urlsPath = projectFolderPath + OpenCVLoader.fileSeparator + OpenCVLoader.webPagesFolder;
        File urlsFolder = new File(urlsPath);
        if (!urlsFolder.exists()) {
            urlsFolder.mkdir();
        }

        return projectFolderPath;
    }
//
//    public OpenCVLoader() {
//
//    }

}
