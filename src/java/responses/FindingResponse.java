/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package responses;

import java.util.ArrayList;
import org.opencv.core.Point;
import org.opencv.core.Scalar;

/**
 *
 * @author ggmendez
 */
public class FindingResponse {
    
    private String path;
    private Scalar meanColor;
    private Point massCenter;
    private int filledArea;
    private double contourArea;
    

    public FindingResponse(String path, Scalar meanColor, Point center, int filledArea, double contourArea) {
        this.path = path;
        this.meanColor = meanColor;
        this.massCenter = center;
        this.filledArea = filledArea;
        this.contourArea = contourArea;
    }
    
    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Scalar getMeanColor() {
        return meanColor;
    }

    public void setMeanColor(Scalar meanColor) {
        this.meanColor = meanColor;
    } 

    public Point getMassCenter() {
        return massCenter;
    }

    public void setMassCenter(Point massCenter) {
        this.massCenter = massCenter;
    }

    public int getFilledArea() {
        return filledArea;
    }

    public void setFilledArea(int filledArea) {
        this.filledArea = filledArea;
    }

    public double getContourArea() {
        return contourArea;
    }

    public void setContourArea(double contourArea) {
        this.contourArea = contourArea;
    }

}
