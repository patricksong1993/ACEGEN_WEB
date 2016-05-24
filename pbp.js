/**
 * Created by Baisheng on 15/04/2016.
 */
"use strict";
var RenderUrlsToFile, arrayOfUrls, system;
system = require("system");

RenderUrlsToFile = function(urls, callbackFinal) {
    var getFilename, next, page, retrieve, urlIndex, webpage;
    urlIndex = 0;
    webpage = require("webpage");
    page = null;

    retrieve = function() {
        var url;
        if (urls.length > 0) {
            url = urls.shift();
            urlIndex++;
            page = webpage.create();
            return page.open('http://www.livescore.in/match/' + url + '/#point-by-point;1', function(status) {
                console.log("Status: " + status);
                page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {

                    var info = page.evaluate(function() {
                        var info = '';
                        var players = $('title').text().split(' | ')[1].split(' - ');

                        var match_score = $('title').text().split(' | ')[0].split(' ')[1];

                        info = info + players[0] + ',' + players[1] + ',' + match_score +',';
                        var server = 1;
                        if ($($('#tab-mhistory-1-history table tr .server')[0]).text() == "") {
                            server = 2;
                        }
                        var all_pbp = '';

                        $('span.ball-type-text').remove()

                        for (i = 1; i < 6; i++) {
                            var table = $('div#tab-mhistory-' + i + '-history table tr');
                            for (j = 1; j < table.length; j++) {
                                if ($(table[j]).text().indexOf(' - ') > -1 & $(table[j]).text().indexOf('6 - 7') == -1 & $(table[j]).text().indexOf('7 - 6') == -1) {
                                    continue;
                                } else if ($(table[j]).text().indexOf('6 - 7') > -1 || $(table[j]).text().indexOf('7 - 6') > -1) {
                                    var pbp = '';
                                    if ($(table[27]).text().indexOf('0 - 1') > -1) {
                                        pbp = pbp + '2';
                                    } else {
                                        pbp = pbp + '1';
                                    }
                                    for (k = 28; k < table.length; k++) {
                                        var tb_score_pre = $(table[k - 1]).text().replace('LOST SERVE', '').trim().split(' - ');
                                        var tb_score_cur = $(table[k]).text().replace('LOST SERVE', '').trim().split(' - ');
                                        if (tb_score_pre[0] == tb_score_cur[0]) {
                                            pbp = pbp + '2';
                                        } else {
                                            pbp = pbp + '1';
                                        }
                                        pbp = pbp;
                                    }
                                    var tb_pbp = '';
                                    if (server == 1) {
                                        tb_pbp = tb_pbp + pbp[0].replace('1', 'S').replace('2', 'R');
                                    } else {
                                        tb_pbp = tb_pbp + pbp[0].replace('2', 'S').replace('1', 'R');
                                    }
                                    var tb_server = 3 - server;
                                    for (l = 1; l < pbp.length; l = l + 2) {
                                        tb_pbp = tb_pbp + '/';
                                        if (tb_server == 1) {
                                            tb_pbp = tb_pbp + pbp[l].replace('1', 'S').replace('2', 'R');
                                        } else {
                                            tb_pbp = tb_pbp + pbp[l].replace('2', 'S').replace('1', 'R');
                                        }
                                        if (pbp[l + 1] != undefined) {
                                            if (tb_server == 1) {
                                                tb_pbp = tb_pbp + pbp[l + 1].replace('1', 'S').replace('2', 'R');
                                            } else {
                                                tb_pbp = tb_pbp + pbp[l + 1].replace('2', 'S').replace('1', 'R');
                                            }
                                        }
                                        tb_server = 3 - tb_server;
                                    }
                                    all_pbp = all_pbp + tb_pbp;
                                } else {
                                    var pbp = '';
                                    var scores = $(table[j]).text().split(', ');
                                    if (scores[0] == '15:0') {
                                        pbp = '1';
                                    } else {
                                        pbp = '2';
                                    }
                                    for (k = 1; k < scores.length; k++) {
                                        var twop_pre = scores[k - 1].split(':');
                                        var twop_cur = scores[k].split(':');
                                        if (scores[k - 1] != '40:AD' & scores[k - 1] != 'AD:40') {
                                            if (twop_pre[0] == twop_cur[0]) {
                                                pbp = pbp + '2';
                                            } else {
                                                pbp = pbp + '1';
                                            }
                                        } else if (scores[k - 1] == 'AD:40' & scores[k] == '40:40') {
                                            pbp = pbp + '2';
                                        } else if (scores[k - 1] == '40:AD' & scores[k] == '40:40') {
                                            pbp = pbp + '1';
                                        }
                                    }
                                    var twop = scores[scores.length - 1].split(':');
                                    if (twop[0] == 'AD') {
                                        pbp = pbp + '1';
                                    } else if (twop[1] == 'AD') {
                                        pbp = pbp + '2';
                                    } else if (twop[0] == '40') {
                                        pbp = pbp + '1';
                                    } else if (twop[1] == '40') {
                                        pbp = pbp + '2';
                                    }
                                    if (server == 1) {
                                        all_pbp = all_pbp + pbp.replace(new RegExp('1', 'g'), 'S').replace(new RegExp('2', 'g'), 'R') + ';';
                                    } else {
                                        all_pbp = all_pbp + pbp.replace(new RegExp('2', 'g'), 'S').replace(new RegExp('1', 'g'), 'R') + ';';
                                    }
                                }
                                server = 3 - server;
                            }
                            all_pbp = all_pbp + '.';
                        }
                        all_pbp = all_pbp.replace(';.', '.').replace(';.', '.').replace(';.', '.').replace(';.', '.').replace(';.', '.').replace('..', '.').replace('..', '.').replace('..', '.');
                        all_pbp = all_pbp.substring(0, all_pbp.length - 1);
                        info = info + all_pbp;
                        return info;
                    });
                    var fs = require('fs');
                    try {
                        fs.write("file2.txt", info, 'a');
                    } catch(e) {
                        console.log(e);
                    }
                    console.log(info);
                    setTimeout(next_page(url),1000);
                });


                    page.close();
                    return retrieve();

            });
        } else {
            return callbackFinal();
        }
    };
    return retrieve();
};

arrayOfUrls = system.args[1].split(',');

RenderUrlsToFile(arrayOfUrls, function() {
    return phantom.exit();
});





function next_page(url) {
    page2 = require('webpage').create();
    page2.open('http://www.livescore.in/match/' + url + '/#match-summary', function(status) {
        console.log("Status: " + status);

        page2.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
            setTimeout(function(){

                var info2 = page2.evaluate(function() {
                    var info = '';

                    var scores = $('.match-time').find('.score');
                    var times = '';
                    for (i = 0; i < scores.length; i++) {
                        times = times + ' ' + $(scores[i]).text();
                    }
                    times = times.trim();


                    var set_scores = '';
                    for (i = 0; i < 5; i++) {
                        var p1 = $($('#summary-content .odd .score.part')[i]).text();
                        var p2 = $($('#summary-content .even .score.part')[i]).text();
                        if (p1[0] == '7' & p2[0] == '6') {
                            set_scores = set_scores + '7-' + p2[0] + '(' + p2[1] + ') ';
                        } else if (p2[0] == '7' & p1[0] == '6') {
                            set_scores = set_scores + p1[0] + '(' + p1[1] + ')-7 ';
                        } else if (p1 != '\xa0' & p2 != '\xa0') {
                            set_scores = set_scores + p1[0] + '-' + p2[0] + ' ';
                        }
                    }
                    set_scores = set_scores.trim();
                    info = ','+set_scores + ',' + times;

                    var date_time = $('#utime').text().split(' ');
                    info = info + ','+date_time[0]+','+date_time[1]+'\n';
                    return info;
                });
                var fs = require('fs');
                try {
                    fs.write("file.txt", info2, 'a');
                } catch(e) {
                    console.log(e);
                }
                console.log(info2);
                phantom.exit()
            }, 500);

        });
    });
}