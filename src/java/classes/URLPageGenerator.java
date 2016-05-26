/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package classes;

import static classes.OpenCVLoader.getProjectFolderPath;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.io.FileUtils;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

/**
 *
 * @author Gonzalo
 */
public class URLPageGenerator {

    private String address;
    private String outFileName;
    private String urlPrefix;
    private String urlSufix;
    private HttpServletRequest request = null;

//    public static String savingDirectory = "C:/Users/Gonzalo/Documents/NetBeansProjects/iVoLVER/" + OpenCVLoader.webPagesFolder;    

    /*public static void main(String[] args) throws IOException {
     //        URLPageGenerator urlPageGenerator = new URLPageGenerator("www.google.com", "google", "\"http://ova.arg-tech.org/analyse.php?=\"");
     //        URLPageGenerator urlPageGenerator = new URLPageGenerator("http://www.bbc.co.uk/news", "bbcNews", "\"http://ova.arg-tech.org/analyse.php?=\"");
     //        URLPageGenerator urlPageGenerator = new URLPageGenerator("https://www.facebook.com/", "facebook", "\"http://ova.arg-tech.org/analyse.php?=\"");
     //        URLPageGenerator urlPageGenerator = new URLPageGenerator("https://www.twitter.com/", "twitter", "\"http://ova.arg-tech.org/analyse.php?=\"");
     //        URLPageGenerator urlPageGenerator = new URLPageGenerator("http://ova.arg-tech.org/", "ova", "\"http://ova.arg-tech.org/analyse.php?=\"");
     URLPageGenerator urlPageGenerator = new URLPageGenerator("https://www.st-andrews.ac.uk", "StAndrews");
     urlPageGenerator.generatePage();
     }*/
    public static String getWebPagesSavingDirectory(HttpServletRequest request) {
        String contextPath = request.getContextPath();
        String projectFolderPath = getProjectFolderPath(contextPath);
        String savingPath = projectFolderPath + OpenCVLoader.fileSeparator + OpenCVLoader.webPagesFolder;
        return savingPath;
    }

    public URLPageGenerator(HttpServletRequest request, String address, String outFileName, String urlPrefix, String urlSufix) {
        String http = "http://";
        String https = "https://";
        if (address.startsWith(http) || address.startsWith(https)) {
            this.address = address;
        } else {
            this.address = http + address;
        }

        this.outFileName = outFileName;
        this.urlPrefix = urlPrefix;
        this.urlSufix = urlSufix;
        this.request = request;
    }

    public URLPageGenerator(HttpServletRequest request, String address, String outFileName) {
        this(request, address, outFileName, "", "");
    }

    public URLPageGenerator(HttpServletRequest request, String address, String outFileName, String urlPrefix) {
        this(request, address, outFileName, urlPrefix, "");
    }

    private Document fixLinks(Document document) {

        System.out.println("fixing Links");

        Elements links = document.select("link[href]");
//        print("\nLinks: (%d)", links.size());
        for (Element link : links) {
            link.attr("href", link.absUrl("href"));
        }

        Elements as = document.select("a[href]");
//        print("\nLinks: (%d)", links.size());
        for (Element a : as) {
//            print(" * a: <%s>  (%s)", link.attr("abs:href"), trim(link.text(), 35));
            a.attr("href", this.urlPrefix + a.absUrl("href") + this.urlSufix);
        }
        return document;
    }

    private Document fixSrcAttributes(Document document) {

        System.out.println("fixing SRC attributes");

        Elements media = document.select("[src]");
//        print("\nMedia: (%d)", media.size());
        for (Element element : media) {
//            print(" * a: <%s>  (%s)", element.absUrl("src"), trim(element.text(), 35));
            element.attr("src", element.absUrl("src"));
        }
        return document;
    }

    private Document fixStyleURLs(Document document) {

        System.out.println("++++++++++++++++++++ fixing style tags");

        Elements styles = document.select("style");
        print("\nStyles: (%d)", styles.size());
        for (Element style : styles) {
            System.out.println("Fixing STYLE: " + styles.indexOf(style));
            String originalInnerHTML = style.html();
            System.out.println("originalInnerHTML: " + originalInnerHTML);

            String backgroundURL = getBackgroundURL(originalInnerHTML);
            String fixedInnerHTML = originalInnerHTML.replaceAll("url\\s*\\((.*?)\\)", "url(" + backgroundURL + ")");

            style.html(fixedInnerHTML);
            System.out.println("Style BEFORE: " + originalInnerHTML);
            System.out.println("Style AFTER: " + fixedInnerHTML);
            System.out.println("Style in document: " + style.html());
            System.out.println();
        }

        System.out.println("*************** fixing style attributes");

        Elements urls = document.select("[style*=url]");
        print("\nURLs: (%d)", urls.size());
        for (Element url : urls) {

            String style = url.attr("style");
//            String style = url.attr("*[style*='background']");

            print(" * %s: %s", url.tagName(), style);

            String absoluteBackgroundURL = this.getBackgroundURL(style);

            System.out.println(absoluteBackgroundURL);

            String newStyleAttribute = this.changeStyleAttribute(style, absoluteBackgroundURL);
            System.out.println("newStyleAttribute:" + newStyleAttribute);

            System.out.println("url.attr(\"style\") BEFORE:");
            System.out.println(url.attr("style"));

            url.attr("style", newStyleAttribute);

            System.out.println("");

            System.out.println("url.attr(\"style\") AFTER:");
            System.out.println(url.attr("style"));

        }
        return document;
    }

    public String generatePage() throws IOException {

        System.out.println("Generating page for the address: " + this.address);

        Connection connection = Jsoup.connect(this.address).userAgent("Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36");
        Document document = connection.get();

        Elements selector = document.select("meta");        
        for (Element element : selector) {
            element.remove();
        }

        Element first = document.head().firstElementSibling();
        first.prepend("<meta name=\"apple-mobile-web-app-capable\" content=\"yes\" />");
        first.prepend("<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black\" />");
        first.prepend("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no\">");
        first.prepend("<meta name=\"viewport\" content=\"minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, initial-scale=1.0\"/>");                                
                
        /*document.body().attr("onmousedown", "parent.mouseEventPreventDefault(this)");
        document.body().attr("onmousemove", "parent.mouseEventPreventDefault(this)");
        document.body().attr("onmouseout", "parent.mouseEventPreventDefault(this)");
        document.body().attr("onmouseover", "parent.mouseEventPreventDefault(this)");
        document.body().attr("onmouseup", "parent.mouseEventPreventDefault(this)");*/
                
        document = this.fixStyleURLs(document);
        document = this.fixLinks(document);
        document = this.fixSrcAttributes(document);
        this.save(document);
        return document.outerHtml();

    }

    private String save(Document document) throws IOException {
        System.out.println("Saving document");
        String fileName = URLPageGenerator.getWebPagesSavingDirectory(request) + OpenCVLoader.fileSeparator + this.outFileName + ".html";
        File file = new File(fileName);
        FileUtils.writeStringToFile(file, document.html(), document.charset());
        System.out.println("Document saved to path: " + fileName);
        return URLPageGenerator.getWebPagesSavingDirectory(request) + OpenCVLoader.fileSeparator + this.outFileName + ".html";
    }

    private static void print(String msg, Object... args) {
        System.out.println(String.format(msg, args));
    }

    private static String trim(String s, int width) {
        if (s.length() > width) {
            return s.substring(0, width - 1) + ".";
        } else {
            return s;
        }
    }

    private String changeStyleAttribute(String style, String absoluteBackgroundURL) {
        return style.replaceAll("url\\s*\\((.*?)\\)", "url(" + absoluteBackgroundURL + ")");
    }

    private String getBackgroundURL(String style) {

        String foundURL = null;

        Pattern pattern = Pattern.compile("url\\s*\\((.*?)\\)");

        Matcher matcher = pattern.matcher(style);

        boolean found = false;
        while (matcher.find()) {
            foundURL = matcher.group(1);
            print("I found the text \"%s\" starting at index %d and ending at index %d.%n", foundURL, matcher.start(), matcher.end());
            found = true;
        }
        if (!found) {
            return style;
        }

        URL base;
        String relUrl = foundURL;
        try {
            try {
                base = new URL(this.address);
            } catch (MalformedURLException e) {
                // the base is unsuitable, but the attribute may be abs on its own, so try that
                URL abs = new URL(relUrl);
                return abs.toExternalForm();
            }
            if (relUrl.startsWith("?")) {
                relUrl = base.getPath() + relUrl;
            }
            URL abs = new URL(base, relUrl);

            return abs.toExternalForm();

        } catch (MalformedURLException e) {
            return "";
        }

    }

}
