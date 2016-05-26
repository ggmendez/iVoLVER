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
 * @author ggmendez
 */
public class ObjectGenerator {
    
    public static Mat extract (Mat image, double x, double y, int w, int h) {
        int row = (int) y;
        int col = (int) x;
        Mat submat = image.submat(row - h/2, row + h/2, col - w/2, col + w/2);
        return submat;
    }
    
}
