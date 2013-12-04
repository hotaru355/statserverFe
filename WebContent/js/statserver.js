(function() {
	var host = (window.location.hostname) ? window.location.hostname : "localhost";
	var restHost = {
		node: "http://" + host + "/node/statserver/",
		tomcat: "http://" + host + "/tomcat/statserver/",
		custom: "http://" + host + "/statserver/",
	};

	// jQuery UI hookup and click handlers
	$(function() {
		$('#tabs').tabs();
		$(document).tooltip();
		$('#tabSendStat .request .createdAt').datetimepicker();

		// click handler to POST a stat
		$('#postStatGuided').button().click(function() {
			var stat = JSON.stringify({
				statName : $('#tabSendStat .request .statName option:selected').val(),
				value : $('#tabSendStat .request .value').val(),
				createdAt : new Date($('#tabSendStat .request .createdAt').val()).getTime()
			});
			var url = getBaseUrl() + 'stats?userName=' + $('#tabSendStat .request .userName').val();
			postStat(stat, url, fillGuidedPost);
		});
		$('#postStatRaw').button().click(function() {
			var stat = $('#tabSendStat .rawJson').val();
			var url = getBaseUrl() + 'stats?' + $('#tabSendStat .queryParam').val();
			postStat(stat, url, fillRawPost);
		});

		// click handler to GET a leaderboard
		$('#getLeaderboardGuided').button().click(function() {
			var url = getBaseUrl() + 'stats/leaderboard?statName=' + $('#tabGetLeaderboard .statName option:selected').val();
			loadLeaderboard(url, fillGuidedLeaderboard);
		});
		$('#getLeaderboardRaw').button().click(function() {
			var url = getBaseUrl() + 'stats/leaderboard?' + $('#tabGetLeaderboard .queryParam').val();
			loadLeaderboard(url, fillRawLeaderboard);
		});

		// click handler to GET a stat
		$('#getStatsGuided').button().click(function() {
			var url = getBaseUrl() + 'stats?userName=' + $('#tabGetStat .userName').val();
			loadStats(url, fillGuidedGet);
		});
		$('#getStatsRaw').button().click(function() {
			var url = getBaseUrl() + 'stats?' + $('#tabGetStat .queryParam').val();
			loadStats(url, fillRawGet);
		});

		// write hostname to page content
		$('#nodeUrl').append(' (' + restHost.node + ')');
		$('#tomcatUrl').append(' (' + restHost.tomcat + ')');
		$('#baseUrl').val(restHost.custom);
	});

	/**
	 * post a new stat to the back end
	 * 
	 */
	function postStat(stat, url, successFunc) {
		$.ajax({
			cache : false,
			async : false,
			url : url,
			type : 'POST',
			contentType : 'application/json',
			dataType : 'json',
			data : stat,
			global : true,
			beforeSend : function() {
				$('input:button').hide();
			},
			complete : function() {
				$('input:button').show();
			},
			success : successFunc
		});
	}
	
	/**
	 * load the stats from the back end
	 * 
	 */
	function loadStats(url, successFunc) {
		$.ajax({
			cache : false,
			async : false,
			url : url,
			type : 'GET',
			contentType : 'text/plain',
			dataType : 'json',
			global : true,
			beforeSend : function() {
				$('input:button').hide();
			},
			complete : function() {
				$('input:button').show();
			},
			success : successFunc
		});
	}
	
	/**
	 * load the leaderboard from the back end
	 * 
	 */
	function loadLeaderboard(url, successFunc) {
		$.ajax({
			cache : false,
			async : false,
			url : url,
			type : 'GET',
			contentType : 'text/plain',
			dataType : 'json',
			global : true,
			beforeSend : function() {
				$('input:button').hide();
			},
			complete : function() {
				$('input:button').show();
			},
			success : successFunc
		});
	}

	function fillGuidedPost(json) {
		var date = new Date(json["createdAt"]);
		var id = (json["_id"]) ? json["_id"] : json["id"];
		$('#tabSendStat .response .id').val(id);
		$('#tabSendStat .response .statName').val(json["statName"]);
		$('#tabSendStat .response .value').val(json["value"]);
		$('#tabSendStat .response .createdAt').val(date.toLocaleString());
	}

	function fillRawPost(json) {
		$('#tabSendStat .response .rawJson').html(JSON.stringify(json));
	}

	function fillGuidedLeaderboard(json) {
		var i = 0;
		var leaders = json.leaders;
		$("#leaderboardTable").find("tr").remove();
		for (; i < leaders.length; i++) {
			$('#leaderboardTable').append(
					'<tr><td>' + leaders[i]['rank'] + '</td><td>' + leaders[i]['userName'] + '</td><td>' + leaders[i]['value'] + '</td><tr>');
		}
	}

	function fillRawLeaderboard(json) {
		$('#tabGetLeaderboard .raw .response .rawJson').html(JSON.stringify(json));
	}

	function fillGuidedGet(json) {
		var i = 0;
		var date;
		var stats = json.stats;
		$("#statsTable").find("tr").remove();
		for (; i < stats.length; i++) {
			date = new Date(stats[i]['createdAt']);
			$('#statsTable').append('<tr><td>' + stats[i]['statName'] + '</td><td>' + stats[i]['value'] + '</td><td>' + date.toLocaleString() + '</td><tr>');
		}
	}

	function fillRawGet(json) {
		$('#tabGetStat .rawJson').html(JSON.stringify(json));
	}

	// display AJAX errors in div
	$(document).ajaxError(function(e, xhr, settings, exception) {
		$('#ajaxError').text('Error in: ' + settings.url + ' - Error: ' + exception + " - Response: " + xhr.responseText);
	});

	// retrieve the base REST URL
	function getBaseUrl() {
		var slash;
		if ($("input[name=restUrl]:checked").val() === "custom") {
			slash = ($('#baseUrl').val().slice(-1) === '/') ? '' : '/';
			return $('#baseUrl').val() + slash;
		} else {
			return restHost[$("input[name=restUrl]:checked").val()];
		}
	}

	// pads single digit numbers with a zero
	function padTo2Digit(num) {
		var s = '0' + num;
		return s.substr(s.length - 2);
	}
})();