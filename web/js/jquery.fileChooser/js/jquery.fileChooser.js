/**
 * @author James Broad
 * Use this plugin where you need to add custom styling and functionality to a file uploading component
 *
 * @example
 * $('.file-chooser').fileChooser({
 *     fileSelector: 'input[type="file"]',
 *     fileLabelSelector: '.file-paths',
 *     helpBlockSelector: '.help-block',
 *     unsupportedFiletypeMessage: 'Oops, we don\'t support that file type',
 *     errorClass: 'has-error'
 * });
 */
(function ($) {
    "use strict";

    $.fileChooser = function (element, options) {
        var defaults = {
                fileSelector: 'input[type="file"]',
                fileLabelSelector: '.file-paths',
                helpBlockSelector: '.help-block',
                unsupportedFiletypeMessage: 'Oops, we don\'t support that file type',
                errorClass: 'has-error'
            },
            fileChooser = this,
            $element = $(element),
            showInvalidFileFormat,
            showValidFileFormat,
            getFileExtensionFromPath,
            isValidFileExtension,
            getAcceptedFileExtensions,
            setFileLabel,
            setControlHasError,
            setHelpMessage;

        fileChooser.settings = {};

        /**
         * An init block, innit
         */
        fileChooser.init = function () {
            // Merge default settings and anything that's provided as a constructor argument
            fileChooser.settings = $.extend({}, defaults, options);

            // Use event delegation to find out when a input[type="file"] esque control is changed
            $element.on('change', fileChooser.settings.fileSelector, function () {
                var $this = $(this), acceptedFileExtensions, fileExtension;
                // If the element has no value defined, well, lets not proceed
                if (!$this.val()) { return false; }

                acceptedFileExtensions = getAcceptedFileExtensions($this);
                fileExtension = getFileExtensionFromPath($this.val());
                if (acceptedFileExtensions.length > 0 && !isValidFileExtension(fileExtension, acceptedFileExtensions)) {
                    showInvalidFileFormat();
                } else {
                    showValidFileFormat();
                }
                setFileLabel($this.val());
                return true;
            });
        };

        /**
         * Is the provided exension in the allowed list of file types
         * @param fileExtension (gif/csv)
         * @param acceptedFileExtensions (['gif', 'csv'])
         * @returns boolean
         */
        isValidFileExtension = function (fileExtension, acceptedFileExtensions) {
            return (fileExtension && $.inArray(fileExtension, acceptedFileExtensions) >= 0);
        };

        /**
         * Parse the accepts attribute on an input[type="file"] and return just the part filename equivalent (text/*csv*)
         * @param $fileInput jQuery wrapped input[type="file"] element
         * @returns [] of file types
         */
        getAcceptedFileExtensions = function ($fileInput) {
            var acceptVal = $fileInput.attr('accept');
            // Specifying no accept attribute implies any file format is ok
            // An empty accepted list implies any file is valid
            if (!acceptVal) {
                return [];
            }
            return $.map(acceptVal.split(','), function (acceptFileType) {
                return acceptFileType.replace(/.*\/([a-zA-Z0-9]*)/, '$1');
            });
        };

        /**
         * Set an element's text to convey the filename chosen
         * @param filename
         */
        setFileLabel = function (filename) {
            // Present the file path
            var fileLabelSelector = fileChooser.settings.fileLabelSelector;
            if (filename) {
                // Filepaths will be shown in a few browsers as C:\fakepath\filename.txt even on non-Windows machines
                filename = filename.replace("C:\\fakepath\\", "");
                $element.find(fileLabelSelector).text(filename);
            }
        };

        /**
         * Take a full path to a file "C:\fakepath\filename.txt" extract the extension (txt)
         * @param path absolute path with filename and extension
         * @returns string
         */
        getFileExtensionFromPath = function (path) {
            var matches = path.match(/\.([a-zA-Z0-9]*)$/);
            if (matches && matches[1]) {
                return matches[1];
            }
            return null;
        };

        /**
         * Convenience method to reset an error state
         */
        showValidFileFormat = function () {
            setHelpMessage('');
            setControlHasError(false);
        };

        /**
         * Convenience method to set error message and state on the component
         */
        showInvalidFileFormat = function () {
            var message = fileChooser.settings.unsupportedFiletypeMessage;
            setHelpMessage(message);
            setControlHasError(true);
        };

        /**
         * If the component has a help message block, set the inner text with provided message.
         * @param message "Eeek, we don't support that kind of file" or "Can you provide a file with a smaller size?"
         */
        setHelpMessage = function (message) {
            $element.find(fileChooser.settings.helpBlockSelector).text(message);
        };

        /**
         * Set the state on the control that it has an error
         * @param hasError
         */
        setControlHasError = function(hasError) {
            var errorClass = fileChooser.settings.errorClass;
            if (!hasError) {
                $element.removeClass(errorClass);
            } else {
                $element.addClass(errorClass);
            }
        };

        fileChooser.init();
    };

    $.fn.fileChooser = function (options) {
        var pluginName = 'fileChooser';
        return this.each(function () {
            if (undefined === $(this).data(pluginName)) {
                var fileChooser = new $.fileChooser(this, options);
                $(this).data(pluginName, fileChooser);
            }
        });
    };
})(jQuery);
