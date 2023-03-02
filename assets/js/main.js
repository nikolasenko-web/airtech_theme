import {
	Collapse,
	Tab,
	Tooltip,
} from 'bootstrap';

import {
	Swiper,
	Controller,
	Pagination,
	Navigation,
	EffectFade,
	Thumbs,
} from 'swiper'

Swiper.use([Controller, Pagination, Navigation, EffectFade, Thumbs])

var swiper = new Swiper(".mySwiper", {
	pagination: {
		el: ".swiper-pagination",
	},
});
