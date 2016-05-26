/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package responses;

import org.opencv.core.Point;
import org.opencv.core.Scalar;

/**
 *
 * @author Gonzalo
 */
public class BlobFoundResponse {
    
     private String path;
     private Point massCenter;
     private double contourArea;
     
     public BlobFoundResponse(String path, Point center, double contourArea) {
        this.path = path;
        this.massCenter = center;
        this.contourArea = contourArea;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Point getMassCenter() {
        return massCenter;
    }

    public void setMassCenter(Point massCenter) {
        this.massCenter = massCenter;
    }

    public double getContourArea() {
        return contourArea;
    }

    public void setContourArea(double contourArea) {
        this.contourArea = contourArea;
    }
     
     
    
}
