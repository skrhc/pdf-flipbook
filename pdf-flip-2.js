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
        document.removeEventListener("pagesloaded", PdfFlip.launchMagazina, true);
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
