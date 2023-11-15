function generate_ckeditor_notifications() {
    window.videoPlayerViewer = [];
    $('body .articleViewer a').each(function( ind, elem ) {
        let href = $(elem).attr('href');
        console.log(elem)
        if ($(elem).hasClass('_doc_')) {
            $(elem).parent().after(`
                <p style="">
                    <object class="content-view" width="100%" height="100%" type="application/pdf" data="${href}">
                    </object>
                </p>
            `);
            // $(elem).parent().remove();
        } else if ($(elem).hasClass('_video_')) {
            let nfbVideoId = null;
            if (href.includes("213.108.4.28/video/player/")) {
                nfbVideoId = href;
                nfbVideoId = nfbVideoId.split("/player/")[1];
            }
            console.log(href)
            $(elem).after(`
                ${nfbVideoId != null ? `
                    <video id="video-player-viewer-${ind}" class="video-js resize-block video-modal" poster="https://nanofootball.pro/video/poster/${nfbVideoId}">
                        <source src="${href}" type="video/mp4" />
                    </video>
                ` : `
                    <video id="video-player-viewer-${ind}" class="video-js resize-block video-modal" poster="">
                        <source src="${href}" type="video/youtube" />
                    </video>
                `}
            `);
            window.videoPlayerViewer.push(videojs(
                $(document).find(`#video-player-viewer-${ind}`)[0], {
                preload: 'auto',
                autoplay: false,
                controls: true,
                aspectRatio: '16:9',
                youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
            }));

            $(elem).remove();
        }
    });
    for (let i = 0; i < window.videoPlayerViewer.length; i++) {
        window.videoPlayerViewer[i].load();
        window.videoPlayerViewer[i].ready((e) => {
            // $(document).find(`#video-player-viewer-${i}`)
            //     .css('height', '88vh');
        });
    }
}