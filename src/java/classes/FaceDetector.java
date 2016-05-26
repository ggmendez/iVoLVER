/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package classes;

import com.google.gson.Gson;
import java.io.File;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.Date;
import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.core.MatOfRect;
import org.opencv.core.Point;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.highgui.Highgui;
import org.opencv.objdetect.CascadeClassifier;

/**
 *
 * @author ggm
 */
public class FaceDetector {
    
    public static String detectFace(String filePath) {
        
//        String dirName = "C:/Users/ggm/Documents/NetBeansProjects/MyWebApplication";
        String dirName = "C:/Users/Gonzalo/Documents/NetBeansProjects/MyWebApplication";
//        String dirName = "/Users/ggmendez/Development/MyWebApplication";

        System.out.println(dirName);

        String frontalfaceFile = dirName + "/data/lbpcascades/lbpcascade_frontalface.xml";
        
        System.out.println(frontalfaceFile);        
        
        CascadeClassifier faceDetector = new CascadeClassifier(frontalfaceFile);

        Mat image = Highgui.imread(filePath);

        System.out.println(image);

            // Detect faces in the image 
        // MatOfRect is a special container class for Rect.
        MatOfRect faceDetections = new MatOfRect();
        faceDetector.detectMultiScale(image, faceDetections);

        System.out.println(String.format("Detected %s faces", faceDetections.toArray().length));

        // Draw a bounding box around each face.
        for (Rect rect : faceDetections.toArray()) {
            Core.rectangle(image, new Point(rect.x, rect.y), new Point(rect.x + rect.width, rect.y + rect.height), new Scalar(0, 255, 0));
        }

            // Save the visualized detection.            
        Date date = new Date();
        Format formatter = new SimpleDateFormat("YYYY-MM-dd_hh-mm-ss");
        String filename = dirName + "/imgs/out_" + formatter.format(date) + ".png";

        System.out.println(String.format("Writing %s", filename));
        Highgui.imwrite(filename, image);
        
        Gson gson = new Gson();
        String jsonResponse = gson.toJson(faceDetections.toArray());
        jsonResponse = jsonResponse.replaceAll("x", "left").replaceAll("y", "top");
        
        return jsonResponse;

    }
    
}
