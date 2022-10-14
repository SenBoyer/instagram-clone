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
        :disable="imageCaptured"
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
          v-model="posts.name"
          class="col col-sm-6"
          label="Username*"
          dense
        />
      </div>
      <div class="row justify-center q-pa-md">
        <q-input
          v-model="posts.caption"
          class="col col-sm-6"
          label="Caption*"
          dense
        />
      </div>
      <div class="row justify-center q-pa-md">
        <q-input
          :loading="loadingState"
          v-model="posts.location"
          class="col col-sm-6"
          label="Location"
          dense
        >
          <template v-slot:append>
            <q-btn
              v-if="!loadingState && locationSupported"
              @click="getLocation()"
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
      <q-btn
        @click="addPost()"
        unelevated
        rounded
        color="grey-9"
        label="Post Image"
        :disable="!posts.caption || !posts.photo"
      />
    </div>
  </q-page>
</template>

<script>
import {
  defineComponent,
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { uid, useQuasar } from "quasar";
import { useUsernameStore } from "../stores/example-store";
import axios from "axios";
require("md-gum-polyfill");

export default defineComponent({
  name: "CameraPage",
  setup() {
    const posts = reactive({
      id: uid(),
      caption: "",
      location: "",
      photo: null,
      date: Date.now(),
      name: "",
    });
    const imageCaptured = ref(false);
    const imageUpload = ref([]);
    const hasCameraSupport = ref(true);
    const video = ref(null);
    const canvas = ref(null);
    const loadingState = ref(false);
    const $q = useQuasar();
    const store = useUsernameStore();

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

    function captureImage() {
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
      imageCaptured.value = true;
      posts.photo = dataURItoBlob(canvas.value.toDataURL());
      disableCamera();
    }

    const captureImageFallback = (event) => {
      posts.photo = event;
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
      reader.readAsDataURL(event.target.files[0]);
      posts.photo = dataURItoBlob(canvas.value.toDataURL());
    };

    const getLocation = () => {
      loadingState.value = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          getCityAndCountry(position);
        },
        (err) => {
          loadingState.value = false;
          $q.dialog({
            title: "Error",
            message: "Could not access user location",
          });
          console.log("err= ", err);
        }
      );
    };

    function getCityAndCountry(position) {
      let apiUrl = `https://geocode.xyz/${position.coords.latitude},${position.coords.longitude}?json=1&auth=96263852041508918902x9212`;
      axios
        .get(apiUrl)
        .then((result) => {
          loadingState.value = false;
          locationSuccess(result);
        })
        .catch((err) => {
          console.log("err= ", err), { timeout: 7000 };
          locationError();
        });
    }

    const disableCamera = () => {
      video.value.srcObject.getVideoTracks().forEach((track) => {
        track.stop();
      });
    };

    const locationSuccess = (result) => {
      if (result.data.country) {
        posts.location = result.data.city + ", " + result.data.state;
      }
    };

    const locationError = () => {
      loadingState.value = false;
      $q.dialog({
        title: "Error",
        message: "Could not access location",
      });
      console.log(err);
    };

    function locationSupported() {
      if ("geolocation" in navigator) return true;
      return false;
    }

    function addPost() {
      $q.loading.show();
      let formData = new FormData();
      formData.append("id", posts.id);
      formData.append("caption", posts.caption);
      formData.append("location", posts.location);
      formData.append("date", posts.date);
      formData.append("file", posts.photo, posts.id + ".png");
      formData.append("name", posts.name);

      axios
        .post(`${process.env.API}/createPost`, formData)
        .then((response) => {
          $q.notify({
            message: "Post created!",
            actions: [{ label: "Dismiss", color: "white" }],
          });
          setTimeout(() => {
            this.$router.push("/");
          }, 1500);
          this.$q.loading.hide();
        })
        .catch((err) => {
          console.log(err);
          $q.dialog({
            title: "Error",
            message: "Sorry! Could not make post.",
          });
          this.$q.loading.hide();
        });
    }

    function dataURItoBlob(dataURI) {
      // https://stackoverflow.com/questions/12168909/blob-from-dataurl
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

    onBeforeUnmount(() => {
      if (hasCameraSupport) {
        disableCamera();
      }
    });

    onMounted(() => {
      initCamera();
    });

    return {
      posts,
      initCamera,
      onMounted,
      onBeforeUnmount,
      captureImage,
      addPost,
      video,
      canvas,
      imageCaptured,
      hasCameraSupport,
      imageUpload,
      captureImageFallback,
      getLocation,
      disableCamera,
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
