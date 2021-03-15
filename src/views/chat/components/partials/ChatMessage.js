export default {
	name: "ChatMessage",
	props: {
		message: {
			type: String,
			required: false
		}
	},
	render: function (createElement) {
		// let found = /((https?):\/\/(www\.)?[a-zа-я0-9-]+\.[a-zа-я0-9-]{2,6})/gi.exec(this.message);
		// console.log(found);
		// var re = /([^\"=]{2}|^)((https?|ftp):\/\/\S+[^\s.,> )\];'\"!?])/gi;
		// var re = /(https?:\/\/|ftp:\/\/|www\.)((?![.,?!;:()]*(\s|$))[^\s]){2,}/gim;

		let re = /(?:http|https|ftp):\/\/\S+[^\s.,> )\];'\"!?]/gi;
		let hrefs = this.message.match(re);
		let splitMessage = this.message.split(re);
		let message = hrefs ? [] : this.message;
		if(hrefs) splitMessage.forEach((mess, index) => {
			message.push(mess)
			if(hrefs[index]) message.push(createElement('a', {
				attrs: {
					href: hrefs[index],
					target: '_blank'
				}
			}, hrefs[index]))
		});
		return createElement('span', message)
	}
}
