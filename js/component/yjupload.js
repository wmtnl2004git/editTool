/**
 * 游记编辑搜索下拉框 
 * 
 * 参数说明:
 * 
 *  依赖:vue2.0,jquery,jquery-ui,jquery.fileupload
 * 
 *		<script type="text/javascript" src='libs/jquery.ui.widget.js'></script>
 *		<script type="text/javascript" src="libs/jquery.fileupload.js"></script>
 *
 *  使用示例：
 * Created by xujia on 2017/4/23.
 */
Vue.component('yjupload-component', {
	props: [],
	data: function() {
		return {
			serverUrl: "http://127.0.0.1:808",
			singleUpPath: null,
			upStatus: false,
			uploadLoaded: 0,
			uploadTotal: 0
		}
	},
	template: '' +
		'<a href="#"  v-on:click="addImg" class="fl">' +
		'	<img src="img/addImgIcon.png" alt="">' +
		'	<span class="img-number">0/50</span>' +
		'	<span  class="text">添加图片</span>	' +		
//		'	<div style="display: none;">'+
		'   		<input style="display: none;" id="fileupload" name="upload_filename" type="file" accept=".jpg,.png,.bmp,jpeg" />' +
//		'	</div>'+
		'</a>',
	mounted: function() {
		var addimgEl = this.$el.querySelector('input');
		this.$options.methods.initFileUpload.bind(this)(addimgEl, function(r) {
			//设置添加成功得图片
			var imgUrl = r.result;
		})
	},
	methods: {
		addImg:function(){
			var addimgEl = this.$el.querySelector('input');
			$(addimgEl).click();
			return false;
		},
		initFileUpload: function(input, callback, nochecksmall) {
			
			var self = this;
			var $modal = $('#progressModal');
			$(input).fileupload({
				url: self.serverUrl + "/upload/uploadpic.do",
				sequentialUploads: true,
				xhrFields: {
					withCredentials: true
				},
				dataType: 'json',
				add: function(e, data) {
					$modal.modal({ backdrop: 'static', keyboard: false });

					var uploadStatus = data.submit();
					var reader = new FileReader();
					reader.readAsDataURL(data.files[0]);
					reader.data = data;
					reader.file = data.files[0];

					if(parseFloat(reader.file.size / 1024).toFixed(2) > (19 * 1024)) {
						popup.sizeSmallError();
						uploadStatus.abort();
						return false;
					}
					// 再次验证上传图片的后缀名
					var imgUrl = reader.file.name.split('.');
					var extensions = imgUrl[imgUrl.length - 1].toLowerCase();
					var imgTypes = '.jpg,.bmp,jpeg,.png';
					if(imgTypes.indexOf(extensions) === -1) {
						modalShow(uploadImgTypeError, 'error-modal');
						uploadStatus.abort();
						return false;
					}
					$(".cancelUpload").on('click', function() {
						uploadStatus.abort();
						$modal.find('div eq(0)').modal("hide");
					})
					reader.onload = function(_file) {
						var image = new Image();
						image.src = _file.target.result;
						image.file = this.file;
						image.data = this.data;
						image.onload = function() {
							var w = this.width,
								h = this.height,
								n = this.file.name;
							if(parseFloat(image.file.size / 1024).toFixed(2) > (20 * 1024) || w > 9999 || h > 9999) {
								modalShow(sizeLargeError, 'error-modal');
								uploadStatus.abort();
								return false;
							}
							if(typeof nochecksmall == "undefined") {
								if(w < 670 || h < 377) {
									popup.sizeSmallError();
									uploadStatus.abort();
									return false;
								} else {
									// 获取 window 的 URL 工具
									var URL = window.URL || window.webkitURL;
									// 通过 file 生成目标 url
									self.singleUpPath = URL.createObjectURL(reader.file);
								}
							}
						}
					}
				},
				done: function(e, data) {

					var resultData = $.parseJSON(data.result);
					if(resultData.returncode == 0) {
						callback && callback(resultData.result);
					}
					if(self.uploadLoaded == self.uploadTotal) {
						//关闭上传进度条
						$modal.find('.progress-bar').css('width', '0%');
						$modal.modal("hide");
					}
				},
				progressall: function(e, data) {
					self.uploadLoaded = data.loaded;
					self.uploadTotal = data.total;
					var progress = parseInt(data.loaded / data.total * 100, 10);
					$modal.find('.progress-bar').css('width', progress + '%');
					$modal.find('.progress-bar .loading').html(progress + '%');
				},
				error: function(jqXHR, textStatus, errorThrown) {
					//关闭上传进度条
					$modal.modal("hide");
					popup.picUplpadFail();
				},
				fileuploadfail: function(e, data) {
					//关闭上传进度条
					$modal.modal("hide");
					popup.picUplpadFail();
				}
			});
		}
	}

});