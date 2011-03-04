
if (phantom.state.length === 0) {
  phantom.state = 'test-phantomejs';
  phantom.open('./test.html');
} else {
  if (phantom.loadStatus === 'success') {
    window.setInterval(function () {
      var list, i, text;
      list = document.body.querySelectorAll('#results > tbody > tr');
      for (i = 0; i < list.length; ++i) {
        text = list[i].innerText.replace(/[\n]/, '');
        if (text.length > 1)
          console.log(text);
        list[i].parentNode.removeChild(list[i]);
      }

      var nums = document.getElementById('nums').innerText.split('/');
      if (nums[0] == nums[1]) {
        console.log('All Tests(' + nums[0] + ') finished');
        phantom.exit(0);
      }
    }, 30);
  }
}
