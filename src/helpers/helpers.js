/**
 * Helpers Functions
 */
import Vue from 'vue'
import vue from '../main.js'
import moment from 'moment';

const config = require('../config');
// Get Date

export function getDateTimeMessage(date, format) {
	let localUTC = moment().utcOffset();
	let newDate = moment(date).utc().utcOffset(localUTC - config.serverUTC);
	let defFormat = moment().format('DD.MM.YYYY') === newDate.format('DD.MM.YYYY') ? 'HH:mm' : 'DD.MM.YYYY';
	return newDate.format(format || defFormat);
}

export function getDateLocalUTC(date, format) {
	format = !!format ? format : 'DD.MM.YYYY HH:mm';
	let localUTC = moment().utcOffset();
	return moment(date).utc().utcOffset(localUTC - config.serverUTC).format(format);
}

export function getTheDate(timestamp, format) {
	let time = timestamp * 1000;
	let formatDate = format ? format : 'MM-DD-YYYY';
	return moment(time).format(formatDate);
}

// Convert Date To Timestamp
export function convertDateToTimeStamp(date, format) {
	let formatDate = format ? format : 'YYYY-MM-DD';
	return moment(date, formatDate).unix();
}

/**
 * Text Truncate
 */
export function textTruncate(str, length, ending) {
	if (length == null) {
		length = 100;
	}
	if (ending == null) {
		ending = '...';
	}
	if (str.length > length) {
		return str.substring(0, length - ending.length) + ending;
	} else {
		return str;
	}
}

/**
 * Function to convert hex to rgba
 */
export function hexToRgbA(hex, alpha) {
	var c;
	if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
		c = hex.substring(1).split('');
		if (c.length === 3) {
			c = [c[0], c[0], c[1], c[1], c[2], c[2]];
		}
		c = '0x' + c.join('');
		return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
	}
	throw new Error('Bad Hex');
}

/**
 * Function to return currenr app layout
 */
export function getCurrentAppLayout(router) {
	let location = router.history.current.fullPath;
	let path = location.split("/")
	return path[1];
}

/**
 * Error handling function
 */
export function handlingErrors(error) {
	let errorText, errorStatus;
	if(typeof error.response === 'object') {
		errorText = error.response.data.message;
		errorStatus = error.response.status;
	}
	let messError = vue.$te('message.errors.' + errorText) ? vue.$t('message.errors.' + errorText) :
		vue.$te('message.errors.' + errorStatus) ? vue.$t('message.errors.' + errorStatus) :
			vue.$t('message.errors.default');
	Vue.notify({
		group: 'auth',
		type: 'error',
		text: messError,
		duration: 1500
	});
}

// Get Attachments href

export function getHrefAttachments(user, file) {
	return `${config.api}/messages/attachments/download/${user._id}/${file.id_message}/${file.filename}`
}

export function getHrefFileType(name) {
	name = name.split('.')
	let type = name[name.length-1];
	// let typefile = config.fileTypes.indexOf(type) !== -1 ? type : 'default';
	return `${process.env.BASE_URL}static/img/file-types/1/${type.toUpperCase()}.png`;
}

export function getPreviewTextChat(message) {
	let preview = '';
	if(!!message.message) preview = message.message;
	else if(!!message.attach && Array.isArray(message.files) && message.files.length > 0) {
		let filesName = [];
		message.files.forEach(function (file) {
			filesName.push(file.originalname);
		});
		preview = filesName.join('\n');
	}
	if(preview.length > 150) preview = preview.substr(0, 120).trim() + ' ...';
	return preview;
}
