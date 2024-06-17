<script>
	const name = /** @type {const} */ 'ryoppippi';

	// @ts-expect-error any
	import img from '$lib/assets/ryoppippi.png?enhanced';
</script>

<div>
	<enhanced:img
		class='object-fit mx-auto aspect-square w-1/2 rounded-full md:h-64 md:w-64'
		src={img}
		alt='profile'
		style:--tag={name} />
</div>

<style>
	/* @property --rotate { */
	/* 	syntax: '<angle>'; */
	/* 	initial-value: 132deg; */
	/* 	inherits: false; */
	/* } */

	/* .cards { */
	/* 	background: #191c29; */
	/* 	width: 100%; */
	/* 	height: 100%; */
	/* 	border-radius: 50%; */
	/* 	padding: 3px; */
	/* 	position: relative; */
	/* 	justify-content: center; */
	/* 	align-items: center; */
	/* } */
	/**/
	/* .cards::before { */
	/* 	position: absolute; */
	/* 	content: ''; */
	/* 	width: 104%; */
	/* 	height: 102%; */
	/* 	border-radius: 48%; */
	/* 	background-image: linear-gradient(var(--rotate), #8f001a, #dd4d51 43%, #ff6b6b); */
	/* 	z-index: -1; */
	/* 	top: -1%; */
	/* 	left: -2%; */
	/* 	animation: spin 2.5s linear infinite; */
	/* } */
	/**/
	/* .cards::after { */
	/* 	position: absolute; */
	/* 	content: ''; */
	/* 	top: calc(var(--card-height) / 6); */
	/* 	left: 0; */
	/* 	right: 0; */
	/* 	z-index: -1; */
	/* 	height: 100%; */
	/* 	width: 100%; */
	/* 	border-radius: 48%; */
	/* 	margin: 0 auto; */
	/* 	transform: scale(0.8); */
	/* 	filter: blur(calc(var(--card-height) / 6)); */
	/* 	background-image: linear-gradient(var(--rotate), #8f001a, #dd4d51 43%, #ff6b6b); */
	/* 	opacity: 1; */
	/* 	animation: spin 2.5s linear infinite; */
	/* } */
	/**/
	/* @keyframes spin { */
	/* 	0% { */
	/* 		--rotate: 0deg; */
	/* 	} */
	/* 	100% { */
	/* 		--rotate: 360deg; */
	/* 	} */
	/* } */
</style>
