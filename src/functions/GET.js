let $_GET = {}

function GET(name) {
	let url = new URL(window.location.href)
	let params = new URLSearchParams(url.search)
	params.forEach((value, key) => {
		$_GET[key] = value
	})
	return $_GET[name]
}

export default GET
