/**
 * Object with image editing functions
 */
module.exports = {
    /**
     * Removes white pixels from top, left, right anf bottom of the image
     * @param imageURL ImageURL data to crop
     * @returns {Promise} Promise that resolves cropped image as imageURL
     */
    crop: (imageURL)=> {
        let image = new Image();
        image.src = imageURL;
        return new Promise((done)=> {
            image.onload = ()=> {
                let canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                let context = canvas.getContext('2d');
                context.drawImage(image, 0, 0);
                //document.body.appendChild(canvas);

                let imageData = context.getImageData(0, 0, image.width, image.height);

                let paddingTop = 0, paddingLeft = 0, paddingRight = 0, paddingBottom = 0;

                //search for top padding
                let data = imageData.data;
                let x = 0, y = 0, n, m;
                loops: for (y = 0, m = image.height; y < m; y++) {
                    for (x = 0, n = image.width; x < n; x++) {
                        let index = (image.width * y + x) * 4;
                        if (data[index] == data[index + 1] && data[index + 1] == data[index + 2] && data[index + 2] == 255) {
                            continue;
                        } else {
                            break loops;
                        }
                    }
                }
                paddingTop = y;

                //search for bottom padding
                loops: for (y = image.height - 1; y >= 0; y--) {
                    for (x = 0, n = image.width; x < n; x++) {
                        let index = (image.width * y + x) * 4;
                        if (data[index] == data[index + 1] && data[index + 1] == data[index + 2] && data[index + 2] == 255) {
                            continue;
                        } else {
                            break loops;
                        }
                    }
                }
                paddingBottom = image.height - y - 1;

                //search for left padding
                loops: for (x = 0, n = image.width; x < n; x++) {
                    for (y = 0, m = image.height; y < m; y++) {
                        let index = (image.width * y + x) * 4;
                        if (data[index] == data[index + 1] && data[index + 1] == data[index + 2] && data[index + 2] == 255) {
                            continue;
                        } else {
                            break loops;
                        }
                    }
                }
                paddingLeft = x;

                //search for right padding
                loops: for (x = image.width - 1; x >= 0; x--) {
                    for (y = 0, m = image.height; y < m; y++) {
                        let index = (image.width * y + x) * 4;
                        if (data[index] == data[index + 1] && data[index + 1] == data[index + 2] && data[index + 2] == 255) {
                            continue;
                        } else {
                            break loops;
                        }
                    }
                }

                paddingRight = image.width - x - 1;

                let cropWidth = image.width - paddingRight - paddingLeft;
                let cropHeight = image.height - paddingBottom - paddingTop;

                let newCanvas = document.createElement('canvas');
                newCanvas.width = cropWidth;
                newCanvas.height = cropHeight;
                let newContext = newCanvas.getContext('2d');
                newContext.drawImage(image, -paddingLeft, -paddingTop);
                done(newCanvas.toDataURL("image/jpeg"));
            }
        });
    }
};
