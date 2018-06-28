var apiready = false;
var videosId = '';
var videoPlayed = false;

function tplawesome(e,t){res=e;for(var n=0;n<t.length;n++){res=res.replace(/\{\{(.*?)\}\}/g,function(e,r){return t[n][r]})}return res}

$(function() {
	$("form").on("submit", function(e) {
		e.preventDefault();

		searchData();
	});

	if (window.location.search.substr(1).substring(0,2)=='v=') {
		var v = window.location.search.substr(3);
		if (v.indexOf('&')==-1) { v=v; }
		else { v = v.substr(0,v.indexOf('&')); }
		var intervalReady = setInterval(function(){
			if (apiready) {
				clearInterval(intervalReady);
				playVideo(v);
			}
		},1000);
	}
});

function searchData() {
	// comprobamos si hay vídeo en reproducción
	if (videoPlayed) {
	}

	document.title = $('#search').val() + ' - youtube';
	// prepare the request
	var request = gapi.client.youtube.search.list({
		part: "snippet",
		q: encodeURIComponent($("#search").val()).replace(/%20/g, "+"),
		maxResults: 15,
		order: "relevance",
		publishedAfter: "2008-01-01T00:00:00Z"
	}); 
	var cont = 1;

	// execute the request
	request.execute(function(response) {
		var results = response.result;
		console.log(response);

		$('.sectionCard').hide();
		$('#sectionSearch').show();

		localStorage.setItem('youtube-response',JSON.stringify(response));

		$('#resultsPage').text(response.pageInfo.resultsPerPage.toLocaleString());
		$('#resultsTotal').text(response.pageInfo.totalResults.toLocaleString());

		var html = '';
		for (i in response.items) {
			if (response.items[i].id.kind=='youtube#video') {
				html += '<div class="searchItem searchItemVideo" id="' + response.items[i].id.videoId + '">';
					if (response.items[i].snippet.liveBroadcastContent=='none') {
						html += '<div class="searchItemLeft"><img class="searchItemImg" src="' + response.items[i].snippet.thumbnails.medium.url + '" /></div>';
					} else {
						html += '<div class="searchItemLeft"><img class="searchItemImg" src="' + response.items[i].snippet.thumbnails.medium.url + '" /><div class="itemLive"><p>Directo</p></div></div>';
					}
					html += '<div class="searchItemCenter">';
					if (relativeDate(response.items[i].snippet.publishedAt,'recent')) {
						html += '<p class="searchItemTitle"><span><svg fill="#FF9800" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-10 5h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></span><a href="https://www.youtube.com/watch?v=' + response.items[i].id.videoId + '">' + response.items[i].snippet.title + '</a></p>';
					} else {
						html += '<p class="searchItemTitle"><a href="https://www.youtube.com/watch?v=' + response.items[i].id.videoId + '">' + response.items[i].snippet.title + '</a></p>';
					}
						html += '<p class="searchItemChannel"><a href="https://www.youtube.com/channel/' + response.items[i].snippet.channelId + '">' + response.items[i].snippet.channelTitle + '</a> &#8226; <span class="itemViews"></span> &#8226; <span>' + relativeDate(response.items[i].snippet.publishedAt,'relative') + '</span></p>';
						html += '<p class="searchItemDescription">' + response.items[i].snippet.description + '</p>';
						html += '<div class="searchItemAdditional"><div class="searchItemReputation"></div>';
							if (response.items[i].snippet.liveBroadcastContent=='none') {
								html += '<div class="searchItemDuration"></div>';
							}
					html += '</div></div>';
				html += '</div>';
			} else if (response.items[i].id.kind=='youtube#playlist') {
				html += '<div class="searchItem searchItemPlaylist">';
					html += '<div class="searchItemLeft">';
						html += '<div class="searchItemPlaylistSvg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M4 10h12v2H4zm0-4h12v2H4zm0 8h8v2H4zm10 0v6l5-3z"/></svg></div>';
						html += '<img class="searchItemImg" src="' + response.items[i].snippet.thumbnails.medium.url + '" />';
					html += '</div><div class="searchItemCenter">';
						html += '<p class="searchItemTitle"><a href="https://www.youtube.com/watch?v=' + response.items[i].id.playlistId + '">' + response.items[i].snippet.title + '</a></p>';
						html += '<p class="searchItemChannel"><a href="https://www.youtube.com/channel/' + response.items[i].snippet.channelId + '">' + response.items[i].snippet.channelTitle + '</a> &#8226; <span>40 mil visualizaciones</span> &#8226; <span>' + relativeDate(response.items[i].snippet.publishedAt) + '</span></p>';
						html += '<p class="searchItemDescription">' + response.items[i].snippet.description + '</p>';
					html += '</div>';
				html += '</div>';
			} else if (response.items[i].id.kind=='youtube#channel') {
				html += '<div class="searchItem searchItemChannel">';
					html += '<div class="searchItemLeft"><img class="searchItemChannelImg" src="' + response.items[i].snippet.thumbnails.medium.url + '" /></div>';
					html += '<div class="searchItemCenter">';
						html += '<p class="searchItemTitle"><a href="https://www.youtube.com/channel/' + response.items[i].id.channelId + '">' + response.items[i].snippet.title + '</a></p>';
						html += '<div class="g-ytsubscribe" data-channelid="UClOf1XXinvZsy4wKPAkro2A" data-layout="default" data-count="default"></div>';
					html += '</div>';
				html += '</div>';
			}
		}
		$('#searchContent').html(html);

		// establecemos eventos para reproducir videos
		$('.searchItemVideo .searchItemTitle').on('click', function(e) {
			e.preventDefault();
			playVideo($(this).parent().parent().attr('id'));
		});

		if ($('script[src="https://apis.google.com/js/platform.js"]').length!=0) {
			$('script[src="https://apis.google.com/js/platform.js"]').remove();
		}
		var script = document.createElement("script");
		script.src = 'https://apis.google.com/js/platform.js';
		document.head.appendChild(script);

		for (i in response.items) {
			if (response.items[i].id.kind=='youtube#video') {
				videosId += response.items[i].id.videoId + ',';
			}
		}
		sessionStorage.setItem('yt-videoIds',JSON.stringify(videosId));
	});

	// obtencion de las visualizaciones después de mostrar los datos de los vídeos
	setTimeout(function() {
		var requestViews = gapi.client.youtube.videos.list({
			part: "snippet,contentDetails,statistics",
			id: JSON.parse(sessionStorage.getItem('yt-videoIds'))
		});

		requestViews.execute(function(respViews) {
			console.log(respViews);
			for (i in respViews.items) {
				selector = respViews.items[i].id;
				likes = parseInt(respViews.items[i].statistics.likeCount);
				totalVotes = parseInt(respViews.items[i].statistics.likeCount)+parseInt(respViews.items[i].statistics.dislikeCount);
				reputation = (likes*100)/totalVotes;

				if (reputation==NaN) { reputation = 0 }

				if (reputation>90) { reputationColor='#66BB6A' }
				else if (reputation>75) { reputationColor='#FFCA28' }
				else if (reputation>0) { reputationColor='#Ef5350' }
				else { reputationColor='#ccc' }
				var reputationHtml = '<div class="reputationTrackBar"><div class="reputationBar" style="width: '+reputation+'%;background-color:'+reputationColor+'"></div></div>';
				if (reputationColor!='#ccc') { reputationHtml += '<span>' + Math.round(reputation,2) + '%</span>' }
				$('#'+selector).find('.searchItemReputation').html(reputationHtml);

				views = respViews.items[i].statistics.viewCount;
				$('#'+selector).find('.itemViews').text(views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' visualizaciones');

				duration = respViews.items[i].contentDetails.duration.replace('PT','');
				duration = duration.replace('H',':');
				duration = duration.replace('M',':');
				if (duration.includes('S')) {
					duration = duration.replace('S','');
				} else {
					duration = duration+'00';
				}
				if (duration.substr(duration.indexOf(":") + 1).length=='1') { duration = duration.substr(0, duration.indexOf(':'))+':0'+duration.substr(duration.length-1) }
				$('#'+selector).find('.searchItemDuration').html('<p>' + duration + '</p>');
			}
		});
	},1000);
}

// función para reproducir vídeos
function playVideo(v) {
	console.log('se está reproduciendo el vídeo con identificador ' + v);
	$('.sectionCard').hide();
	$('#sectionWatch').show();
	$(window).scrollTop(0);

	$('#watchPlayer').css('height',window.innerHeight-50);

	var requestWatch = gapi.client.youtube.videos.list({
		part: "snippet,contentDetails,statistics",
		id: v
	});

	requestWatch.execute(function(response) {
		console.log(response);
		if (response.result.items.length==1) {
			//$('#player').html('<iframe id="playerFrame" src="https://www.youtube.com/embed/vnVeVWYMLIs?showinfo=0&amp;autoplay=1" frameborder="0" allowfullscreen=""></iframe>');
			$('#player').html('<iframe id="playerFrame" src="https://www.youtube.com/embed/' + v + '?showinfo=0&autoplay=1" frameborder="0" allowfullscreen></iframe>');
			$('#watchContentTitle').text(response.result.items[0].snippet.title);
			$('#playerFrame').css('height',window.innerHeight-50);

			$('#watchViews').html('<p>' + response.result.items[0].statistics.viewCount.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' visualizaciones</p>');
			if (response.result.items[0].statistics.likeCount && response.result.items[0].statistics.dislikeCount) {
				var likes = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve"><g id="Bounding_Boxes"><g id="ui_x5F_spec_x5F_header_copy_2"></g><path opacity="0.87" fill="none" d="M0,0h24v24H0V0z"/></g><g id="Rounded"><g><path d="M13.12,2.06L7.58,7.6C7.21,7.97,7,8.48,7,9.01V19c0,1.1,0.9,2,2,2h9c0.8,0,1.52-0.48,1.84-1.21l3.26-7.61C23.94,10.2,22.49,8,20.34,8h-5.65l0.95-4.58c0.1-0.5-0.05-1.01-0.41-1.37l0,0C14.64,1.47,13.7,1.47,13.12,2.06z"/><path d="M3,21L3,21c1.1,0,2-0.9,2-2v-8c0-1.1-0.9-2-2-2h0c-1.1,0-2,0.9-2,2v8C1,20.1,1.9,21,3,21z"/></g></g></svg>';
				likes += '<p>' + response.result.items[0].statistics.likeCount.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '</p>';
				var dislikes = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve"><g id="Bounding_Boxes"><g id="ui_x5F_spec_x5F_header_copy_2"></g><path opacity="0.87" fill="none" d="M0,0h24v24H0V0z"/></g><g id="Rounded"><g><path d="M10.88,21.94l5.53-5.54c0.37-0.37,0.58-0.88,0.58-1.41V5c0-1.1-0.9-2-2-2H6C5.2,3,4.48,3.48,4.17,4.21l-3.26,7.61C0.06,13.8,1.51,16,3.66,16h5.65l-0.95,4.58c-0.1,0.5,0.05,1.01,0.41,1.37l0,0C9.36,22.53,10.3,22.53,10.88,21.94z"/><path d="M21,3L21,3c-1.1,0-2,0.9-2,2v8c0,1.1,0.9,2,2,2h0c1.1,0,2-0.9,2-2V5C23,3.9,22.1,3,21,3z"/></g></g></svg>';
				dislikes += '<p>' + response.result.items[0].statistics.dislikeCount.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '</p>';
				$('#watchVotes').html(likes + dislikes);
			} else {
				$('watchVotes').html('');
			}

			$('#watchChannel').html('<div class="g-ytsubscribe" data-channelid="' + response.result.items[0].snippet.channelId + '" data-layout="full" data-count="default"></div><a href="https://www.youtube.com/channel/' + response.result.items[0].snippet.channelId + '"><div id="watchChannelOver"></div></a>');

			if ($('script[src="https://apis.google.com/js/platform.js"]').length!=0) {
				$('script[src="https://apis.google.com/js/platform.js"]').remove();
			}
			var script = document.createElement("script");
			script.src = 'https://apis.google.com/js/platform.js';
			document.head.appendChild(script);

			$('#watchDescriptionText').html('<p split-lines>' + response.result.items[0].snippet.description + '</p>');
			if ($('#watchDescriptionText p').height() > 250) { $('#watchDescriptionExpand').show() }
			else { $('#watchDescriptionExpand').hide() }

			$('#watchDescriptionExpand').on('click', function() {
				if ($('#watchDescriptionText').height()>250) {
					$('#watchDescriptionText').css('max-height','250px');$('#watchDescriptionExpand p').text('Mostrar Más');
				} else {
					$('#watchDescriptionText').css('max-height','none');$('#watchDescriptionExpand p').text('Mostrar Menos');
				}
			});

			$('#commentsLoading').show();


		videoPlayed = true;

		//watchComments(v);
		watchRelated(v);
		}
	});
}

function watchComments(v) {
	console.log('watchComments');
	var request = gapi.client.youtube.commentThreads.list({
		part: "snippet",
		videoId: v,
		maxResults: 15,
		order: "relevance",
	});

	request.execute(function(response) {
		console.log(response);
	});
}

function watchRelated(v) {
	console.log('watchRelated');
	var request = gapi.client.youtube.search.list({
		part: "snippet",
		type: 'video',
		relatedToVideoId: v,
		maxResults: 15,
		order: "relevance",
		publishedAfter: "2008-01-01T00:00:00Z"
	});

	request.execute(function(response) {
		console.log(response);

		var html = '';
		if (response.result.items.length>0) {
			for (i in response.result.items) {
				html += '<div class="videoRelated">';
				html += '<div class="relatedLeft"><img class="relatedImg" src="' + response.result.items[i].snippet.thumbnails.medium.url + '" /></div>';
				html += '<div class="relatedCenter"><p>' + response.result.items[i].snippet.title + '</p></div>';
				html += '</div>';
			}
		} else {
			html += '<p>No hay vídeos relacionados</p>';
		}

		$('#watchRelated').html(html);
	});
}


// -------------------------------------------------------

function init() {
    gapi.client.setApiKey("AIzaSyDQgJCPKdxIrWBfeTGneb22U1tCfHw-KT0");
    gapi.client.load("youtube", "v3", function() {
        // yt api is ready
        console.log('API ready');
        apiready=true;
    });
}

function relativeDate(date,recent) {
	fActual = new Date();
	fVideo = new Date(Date.parse(date));

	var recentValue = false;

	fDiff = Math.abs(fActual.getTime() - fVideo.getTime());

	fMinutes = Math.floor(fDiff / 1000 * 60);
	fHours = Math.floor(fDiff / (1000 * 3600));
	fDays = Math.floor(fDiff / (1000 * 3600 * 24));
	fMonths = Math.floor(fDiff / (1000*3600*24*31));
	fYears = Math.floor(fDiff / (1000*3600*24*365));

	if (fYears>0) {
		if (fYears==1) { fResult = 'Hace ' + fYears + ' año'; }
		else { fResult = 'Hace ' + fYears + ' años'; }
	} else if (fMonths>0) {
		if (fMonths==1) { fResult = 'Hace ' + fMonths + ' mes'; }
		else { fResult = 'Hace ' + fMonths + ' meses'; }
	} else if (fDays>0) {
		if (fDays<7) { recentValue = true; }
		if (fDays==1) { fResult = 'Hace ' + fDays + ' día'; }
		else { fResult = 'Hace ' + fDays + ' días'; }
	} else if (fHours>0) {
		recentValue = true;
		if (fHours==1) { fResult = 'Hace ' + fHours + ' hora'; }
		else { fResult = 'Hace ' + fHours + ' horas'; }
	} else {
		recentValue = true;
		if (fMinutes==1) { fResult = 'Hace ' + fMinutes + ' minuto'; }
		else { fResult = 'Hace ' + fMinutes + ' minutos'; }
	}
	if (recent=='recent') {
		return recentValue;
	} else {
		return fResult;
	}
	
}