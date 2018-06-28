$(function() {
	var response = JSON.parse(localStorage.getItem('youtube-response'));
	response = response.result;
	console.log(response);

	var html = '';
	for (i in response.items) {
		html += '<div class="searchItem">';
			html += '<div class="searchItemLeft"><img class="searchItemImg" src="' + response.items[i].snippet.thumbnails.medium.url + '" /></div>';
			html += '<div class="searchItemCenter">';
				html += '<p class="searchItemTitle"><a href="https://www.youtube.com/watch?v=' + response.items[i].id.videoId + '">' + response.items[i].snippet.title + '</p>';
				html += '<p class="searchItemChannel"><a href="https://www.youtube.com/channel/' + response.items[i].snippet.channelId + '">' + response.items[i].snippet.channelTitle + '</a> &#8226; <span>40 mil visualizaciones</span> &#8226; <span>' + relativeDate(response.items[i].snippet.publishedAt) + '</span></p>';
				html += '<p class="searchItemDescription">' + response.items[i].snippet.description + '</p>';
			html += '</div>';
		html += '</div>';
	}
	$('#searchContent').html(html);

	$('#sectionSearch').show();
});

function relativeDate(date) {
	fActual = new Date();
	fVideo = new Date(Date.parse(date));

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
		if (fDays==1) { fResult = 'Hace ' + fDays + ' día'; }
		else { fResult = 'Hace ' + fDays + ' días'; }
	} else if (fHours>0) {
		if (fHours==1) { fResult = 'Hace ' + fHours + ' hora'; }
		else { fResult = 'Hace ' + fHours + ' horas'; }
	} else {
		if (fMinutes==1) { fResult = 'Hace ' + fMinutes + ' minuto'; }
		else { fResult = 'Hace ' + fMinutes + ' minutos'; }
	}
	return fResult;
}