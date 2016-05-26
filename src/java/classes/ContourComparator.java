/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package classes;

import java.util.Comparator;
import org.opencv.core.MatOfPoint;
import org.opencv.imgproc.Imgproc;

/**
 *
 * @author Gonzalo
 */
public class ContourComparator implements Comparator<MatOfPoint> {
    
    @Override
    public int compare(MatOfPoint a, MatOfPoint b) {
        double area1 = Imgproc.contourArea(a);
        double area2 = Imgproc.contourArea(b);
        if (area1 > area2) {
            return 1;
        } else if (area1 < area2) {
            return -1;
        } else {
            return 0;
        }
    }
    
}
