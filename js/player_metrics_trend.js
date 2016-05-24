/**
 * Created by Baisheng on 28/04/2016.
 */

$('.ui.dropdown')
    .dropdown({
        allowAdditions: true,
        maxSelections: 4
    })
;

$($('#metrics_level_game')[0]).parent().hide()
$($('#metrics_level_set')[0]).parent().hide()

$($('#metrics_level')[0]).parent().dropdown({
    onChange:function(val){
        if (val == 'game') {
            $($('#metrics_level_game')[0]).parent().show()
            $($('#metrics_level_set')[0]).parent().hide()
        } else if (val == 'set') {
            $($('#metrics_level_set')[0]).parent().show()
            $($('#metrics_level_game')[0]).parent().hide()
        } else {
            $($('#metrics_level_game')[0]).parent().hide()
            $($('#metrics_level_set')[0]).parent().hide()
        }
    }
})

$('.ui.checkbox').checkbox();

$('#reset_configs').click(function() {
    window.location.reload();
})

$('#get_player_stats').click(function() {

    var player_name = $('#player_name').val();
    var metrics_level = $('#metrics_level').dropdown('get value')[0];
    var baseline_impact = $('#baseline_impact').dropdown('get value')[0];
    var serve_return = $('#serve_return').dropdown('get value')[0];
    var start_year = $('#start_year').dropdown('get value')[0];
    var end_year = $('#end_year').dropdown('get value')[0];
    var surface = $('#surface').dropdown('get value')[0];
    var two_step = $('#two_step').checkbox('is checked');

    $.get( "http://localhost:5000/multi_player?player_name="+player_name+"&metrics_level="+metrics_level+"&baseline_impact="+baseline_impact+"&serve_return="+serve_return+'&start_year='+start_year+'&end_year='+end_year+'&surface='+surface+'&two_step='+two_step,
        function(player_stats) {
            radar_multi(player_stats)
        })
})


function radar_multi(player_stats) {
    colors = [['#ccebff','#ffcccc','#ccffcc','#f2f2f2'],['#80ccff','#ff9999','#99ff99','#d9d9d9'],['#33adff','#ff6666','#00e600','#b3b3b3'],['#008ae6','#ff1a1a','#009900','#8c8c8c']]
    flat_stats = []
    player_names = Object.keys(player_stats.player_stats)
    // max
    for (p in player_names) {
        var max = []
        for (x in player_stats.player_stats[player_names[p]].ci) {
            max.push(player_stats.player_stats[player_names[p]].ci[x]+player_stats.player_stats[player_names[p]].mean[x])
        }
        flat_stats.push({
            name: player_names[p]+' CI Max',
            type: 'area',
            data: max,
            pointPlacement: 'on',
            color: colors[0][p],
            visible: false
        })
    }
    // min
    for (p in player_names) {
        var min = []
        for (x in player_stats.player_stats[player_names[p]].ci) {
            min.push(player_stats.player_stats[player_names[p]].mean[x]-player_stats.player_stats[player_names[p]].ci[x])
        }
        flat_stats.push({
            name: player_names[p]+' CI Min',
            type: 'area',
            data: min,
            pointPlacement: 'on',
            color: colors[1][p],
            visible: false
        })
    }
    // mean
    for (p in player_names) {
        flat_stats.push({
            name: player_names[p]+' Mean',
            type: 'line',
            data: player_stats.player_stats[player_names[p]].mean,
            pointPlacement: 'on',
            color: colors[2][p]
        })
    }
    // match level
    for (p in player_names) {
        var match = []
        for (x in player_stats.player_stats[player_names[p]].ci) {
            match.push(player_stats.player_stats[player_names[p]].mean[0])
        }
        flat_stats.push({
            name: player_names[p]+' Match Mean',
            type: 'line',
            data: match,
            pointPlacement: 'on',
            color: colors[3][p],
            visible: false
        })
    }

    var metrics_level = capFirst($('#metrics_level').dropdown('get value')[0]);
    var baseline_impact = capFirst($('#baseline_impact').dropdown('get value')[0]);
    var serve_return = capFirst($('#serve_return').dropdown('get value')[0]);
    if (baseline_impact == 'Baseline'){
        start_val = 0
    } else {
        start_val = -1
    }
    $('#container').highcharts({

        chart: {
            polar: true,
            backgroundColor: '#FDFDFD'
        },

        pane: {
            size: '80%'
        },

        title: {
            text: player_names.join(' vs ')
        },

        subtitle: {
            text: metrics_level+' Level '+serve_return+' '+baseline_impact
        },

        xAxis: {
            categories: player_stats.header,
            tickmarkPlacement: 'on',
            lineWidth: 0
        },


        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: start_val
        },
        plotOptions: {
            area: {
                threshold: start_val
            }
        },

        series: flat_stats
    });

    $('text:contains(Highcharts.com)').remove()
}



function capFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}