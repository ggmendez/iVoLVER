/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package classes;

import com.recognition.software.jdeskew.ImageDeskew;
import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;
import net.sourceforge.tess4j.TessAPI;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.Tesseract1;
import net.sourceforge.vietocr.ImageHelper;
import org.opencv.core.Mat;

/**
 *
 * @author ggmendez
 */
public class TextRecognizer {

    public static String recognizeInSkewedImage(String fileName, boolean useAdvancedConfiguration) throws Exception {

        File imageFile = new File(fileName);
        double MINIMUM_DESKEW_THRESHOLD = 0.05d;

        Tesseract instance = new Tesseract();

        int ocrEngineMode = TessAPI.TessOcrEngineMode.OEM_TESSERACT_ONLY;
        instance.setOcrEngineMode(ocrEngineMode);
        if (useAdvancedConfiguration) {
            instance.setPageSegMode(TessAPI.TessPageSegMode.PSM_SINGLE_BLOCK);
        }

        BufferedImage bi = ImageIO.read(imageFile);
        ImageDeskew id = new ImageDeskew(bi);
        double imageSkewAngle = id.getSkewAngle(); // determining skew angle        
        if ((imageSkewAngle > MINIMUM_DESKEW_THRESHOLD || imageSkewAngle < -(MINIMUM_DESKEW_THRESHOLD))) {
            bi = ImageHelper.rotateImage(bi, -imageSkewAngle); // deskewing the loaded image
        }
        return instance.doOCR(bi);
    }

    public static String recognize(String fileName, boolean useAdvancedConfiguration) throws Exception {
        String recognizedText = null;
        File imageFile = new File(fileName);
        Tesseract instance = new Tesseract();

        int ocrEngineMode = TessAPI.TessOcrEngineMode.OEM_TESSERACT_ONLY;
        instance.setOcrEngineMode(ocrEngineMode);

        if (useAdvancedConfiguration) {
            instance.setPageSegMode(TessAPI.TessPageSegMode.PSM_SINGLE_BLOCK);
        }
        recognizedText = instance.doOCR(imageFile);
        return recognizedText;
    }

    public static String recognize(Mat image, boolean useAdvancedConfiguration) throws Exception {
        String recognizedText = null;
        BufferedImage bufferedImage = Util.mat2Img(image);
        Tesseract instance = new Tesseract();
        int ocrEngineMode = TessAPI.TessOcrEngineMode.OEM_TESSERACT_ONLY;
        instance.setOcrEngineMode(ocrEngineMode);
        if (useAdvancedConfiguration) {
            instance.setPageSegMode(TessAPI.TessPageSegMode.PSM_SINGLE_BLOCK);
        }
        recognizedText = instance.doOCR(bufferedImage);
        return recognizedText;
    }

    public static String recognize(BufferedImage bufferedImage, boolean useAdvancedConfiguration) throws Exception {
        String recognizedText = null;
        Tesseract instance = new Tesseract();
        int ocrEngineMode = TessAPI.TessOcrEngineMode.OEM_TESSERACT_ONLY;
        instance.setOcrEngineMode(ocrEngineMode);
        if (useAdvancedConfiguration) {
            instance.setPageSegMode(TessAPI.TessPageSegMode.PSM_SINGLE_BLOCK);
        }
        recognizedText = instance.doOCR(bufferedImage);
        return recognizedText;
    }

}
