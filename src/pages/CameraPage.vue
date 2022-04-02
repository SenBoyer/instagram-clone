<template>
  <q-page class="constrain-more q-pa-md">
    <div class="camera-frame q-pa-md">
      <video
        v-show="!imageCaptured"
        ref="video"
        class="full-width"
        autoplay
        playsinline
      />
      <canvas
        v-show="imageCaptured"
        ref="canvas"
        class="full-width"
        height="240"
      />
    </div>
    <div class="text-center q-pa-md">
      <q-btn
        v-if="hasCameraSupport"
        @click="captureImage()"
        round
        color="grey-10"
        icon="fa-solid fa-camera"
      />
      <q-file
        v-else
        @input="captureImageFallback"
        accept="image/*"
        outlined
        v-model="imageUpload"
        label="Choose an image"
      >
        <template v-slot:prepend>
          <q-icon name="attach_file" />
        </template>
      </q-file>
      <div class="row justify-center q-pa-md">
        <q-input
          v-model="posts.caption"
          class="col col-sm-6"
          label="caption"
          dense
        />
      </div>
      <div class="row justify-center q-pa-md">
        <q-input
          :loading="loadingState"
          v-model="posts.location"
          class="col col-sm-6"
          label="location"
          dense
        >
          <template v-slot:append>
            <q-btn
              v-if="!loadingState && locationSupported"
              @click="getLocation"
              round
              dense
              flat
              icon="my_location"
            />
          </template>
        </q-input>
      </div>
    </div>
    <div class="row justify-center q-mt-lg">
      <q-btn unelevated rounded color="grey-9" label="Post Image" />
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { uid } from "quasar";
import axios from "axios";
require("md-gum-polyfill");

export default defineComponent({
  name: "CameraPage",
  setup() {
    const posts = ref([
      {
        id: uid(),
        caption: "",
        location: "",
        photo: null,
        date: Date.now(),
      },
    ]);
    const imageCaptured = ref(false);
    const imageUpload = ref([]);
    const hasCameraSupport = ref(true);
    const video = ref(null);
    const canvas = ref(null);
    const loadingState = ref(false);

    const initCamera = () => {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then((stream) => {
          video.value.srcObject = stream;
        })
        .catch((error) => {
          hasCameraSupport.value = false;
        });
    };

    const captureImage = () => {
      canvas.value.width = video.value.getBoundingClientRect().width;
      canvas.value.height = video.value.getBoundingClientRect().height;
      let context = canvas.value.getContext("2d");
      context.drawImage(
        video.value,
        0,
        0,
        canvas.value.width,
        canvas.value.height
      );
      imageCaptured.value = "True";
      posts.value.photo = dataURItoBlob(canvas.value.toDataURL());
      console.log(posts.value.photo);
    };

    const captureImageFallback = (file) => {
      posts.value.photo = file;
      let context = canvas.value.getContext("2d");

      let reader = new FileReader();
      reader.onload = (event) => {
        let img = new Image();
        img.onload = () => {
          canvas.value.width = img.width;
          canvas.value.height = img.height;
          context.drawImage(img, 0, 0);
          imageCaptured.value = true;
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    };

    const captureImageFallback2 = () => {
      let imageLoader = document.getElementById("uploader");
      imageLoader.addEventListener("change", handleImage, false);
      let context = canvas.value.getContext("2d");

      function handleImage(event) {
        let reader = new FileReader();
        reader.onload = function (event) {
          let img = new Image();
          img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(event.target.files[0]);
      }
    };

    const getLocation = () => {
      loadingState.value = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          getCityAndCountry(position);
        },
        (err) => {
          console.log("err= ", err);
        }
      );
    };

    function getCityAndCountry(position) {
      console.log("getcitycountry position.coords = ", position.coords);
      console.log(position.coords.latitude);
      console.log(position.coords.longitude);
      let apiUrl = `http://geocode.xyz/${position.coords.latitude},${position.coords.longitude}?json=1&auth=96263852041508918902x9212`;
      console.log("apiUrl= ", apiUrl);
      axios
        .get(apiUrl)
        .then((result) => {
          const state = result.data.state;
          const city = result.data.city;
          console.log("city = ", city);
          console.log("state = ", state);
          loadingState.value = false;
          locationSuccess(result);
        })
        .catch((err) => {
          console.log("err= ", err), { timeout: 7000 };
          loadingState.value = false;
        });
    }

    const locationSuccess = (result) => {
      posts.value.location = result.data.city;
      if (result.data.country) {
        posts.value.location += `, ${result.data.state}`;
      }
    };

    function locationSupported() {
      if ("geolocation" in navigator) return true;
      return false;
    }

    function dataURItoBlob(dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      var byteString = atob(dataURI.split(",")[1]);
      // var byteString = Buffer.from(dataURI, "base64");

      // separate out the mime component
      var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);

      // create a view into the buffer
      var ia = new Uint8Array(ab);

      // set the bytes of the buffer to the correct values
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      var blob = new Blob([ab], { type: mimeString });
      return blob;
    }

    onMounted(() => {
      initCamera();
    });

    return {
      posts,
      initCamera,
      onMounted,
      captureImage,
      video,
      canvas,
      imageCaptured,
      hasCameraSupport,
      imageUpload,
      captureImageFallback,
      getLocation,
      getCityAndCountry,
      locationSuccess,
      loadingState,
      locationSupported,
    };
  },
});
</script>

<style lang="sass">
.camera-frame
  border: 2px solid $grey-10
  border-radius: 15px
</style>