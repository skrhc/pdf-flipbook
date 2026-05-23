var PdfFlip = {
    magazineMode: true,
    oldScale: 1,
    currentPage: 1,
    currentScale: 1,
    layout: 'double',
    maxScale: 1,
    audioSrc: "sound/page-flip.mp3",
    init: function () {

        $(window).bind('keydown', function (e) {
            if (e.target && e.target.tagName.toLowerCase() != 'input') {
                if (e.keyCode == 37 || e.keyCode == 38) {
                    $("#magazine").turn('previous');
                }
                else if (e.keyCode == 39 || e.keyCode == 40) {
                    $("#magazine").turn('next');
                }
            }
        });

        document.addEventListener("pagesloaded", PdfFlip.launchMagazineMode, true);
    },
    launchMagazineMode: function (e) {
        document.removeEventListener("pagesloaded", PdfFlip.launchMagazineMode, true);
        PdfFlip.start();
    },
    start: function () {
        PDFViewerApplication.disableWorker = true;

        PdfFlip.magazineMode = true;
        PdfFlip.oldScale = PDFViewerApplication.pdfViewer.currentScale;
        PDFViewerApplication.pdfViewer.currentScaleValue = 'page-fit';

        $('#viewerContainer').after('<div id="magazineContainer"><div id="magazine"></div></div>');
        $("#viewerContainer").hide();
        $("#viewer").hide();
        $(".se-pre-con").hide();
        $("#magazine").show();

        PdfFlip.currentPage = PDFViewerApplication.page;

        var pages = [1];

        PdfFlip.loadTurnJsPages(pages, $('#magazine'), true, true).then(function () {

            $("#magazine").turn({
                autoCenter: true,
                display: 'double',
                width: $("#viewer .canvasWrapper canvas")[0].width,
                height: $("#viewer .canvasWrapper canvas")[0].height,
                pages: PDFViewerApplication.pdfDocument.numPages,
                page: 1,
                elevation: 100,
                duration: 600,
                acceleration: !PdfFlip.isChrome(),
                when: {
                    missing: function (event, pages) {
                        PdfFlip.loadTurnJsPages(pages, this, false, false);
                    },
                    turning: function (event, page, view) {
                        if (!$('#magazine').turn('hasPage', page)) {
                            PdfFlip.loadTurnJsPages([page], this, false, true).then(function () {
                                $('#magazine').turn('page', page);
                            });
                            event.preventDefault();
                        }
                        PdfFlip.startTurnSound();
                        PdfFlip.currentPage = page;
                        PDFViewerApplication.page = page;
                    },
                    turned: function(event, page, view){

                    }
                }
            });

            setTimeout(function () {
                $("#magazine").turn("display", 'double');

                var multiplier = 2;

                $("#magazine").turn("size",
                    $("#magazine canvas")[0].width * multiplier,
                    $("#magazine canvas")[0].height);

                if (PdfFlip.currentPage > 1)
                    $("#magazine").turn("page", PdfFlip.currentPage);

                $('#magazine').on('click', function(e) {
                    var offset = $(this).offset();
                    var width = $(this).width();
                    var clickX = e.pageX - offset.left;
                    
                    if (clickX > width / 2) {
                        $(this).turn('next');
                    } else {
                        $(this).turn('previous');
                    }
                });

                $('#magazineContainer').css({
                    width: $(window).width(),
                    height: $(window).height()
                });

            }, 10);
        });

    },
    startTurnSound: function () {
        var audio = new Audio(PdfFlip.audioSrc);
        audio.play();
    },

    loadTurnJsPages: function (pages, magazine, isInit, defer, scale) {
        var deferred = null;

        if (defer)
            deferred = $.Deferred();

        var pagesRendered = 0;
        for (var i = 0; i < pages.length; i++) {
            PDFViewerApplication.pdfDocument.getPage(pages[i]).then(function (page) {

                var destinationCanvas = document.createElement('canvas');

                var unscaledViewport = page.getViewport(1);
                var divider = 2;

                var scale = Math.min((($('#mainContainer').height() - 20) / unscaledViewport.height), ((($('#mainContainer').width() - 80) / divider) / unscaledViewport.width));

                var viewport = page.getViewport(scale);

                if (PdfFlip.currentScale > 1)
                    viewport = page.getViewport(PdfFlip.currentScale);

                destinationCanvas.height = viewport.height;
                destinationCanvas.width = viewport.width;

                var renderContext = {
                    canvasContext: destinationCanvas.getContext("2d"),
                    viewport: viewport
                };

                page.render(renderContext).promise.then(function () {
                    pagesRendered++;

                    destinationCanvas.setAttribute('data-page-number', page.pageNumber);
                    destinationCanvas.id = 'magCanvas' + page.pageNumber;

                    if (!isInit) {
                        if ($(magazine).turn('hasPage', page.pageNumber)) {
                            var oldCanvas = $('#magCanvas' + page.pageNumber)[0];
                            oldCanvas.width = destinationCanvas.width;
                            oldCanvas.height = destinationCanvas.height;

                            var oldCtx = oldCanvas.getContext("2d");
                            oldCtx.drawImage(destinationCanvas, 0, 0);
                        }
                        else {
                            $(magazine).turn('addPage', $(destinationCanvas), page.pageNumber);
                        }
                    }
                    else {
                        $("#magazine").append($(destinationCanvas));
                    }

                    if (pagesRendered == pages.length)
                        if (deferred)
                            deferred.resolve();
                });
            });
        }

        if (deferred)
            return deferred;

    },
    isChrome: function () {
        return navigator.userAgent.indexOf('Chrome') != -1;
    }
};
