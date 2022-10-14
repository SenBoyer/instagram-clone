<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <template v-if="!currentlyLoading && posts.length">
          <q-card
            v-for="post in posts"
            :key="post.id"
            class="user-card q-mb-md"
            flat
            bordered
          >
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-bold">{{ post.name }}</q-item-label>
                <q-item-label caption> {{ post.location }} </q-item-label>
              </q-item-section>
              <q-btn
                @click="deletePost(post.id)"
                square
                color="red"
                icon="fa-solid fa-x"
              />
            </q-item>

            <q-separator />
            <q-img :src="post.imgUrl" />
            <q-card-section>
              <div>{{ post.caption }}</div>
              <div class="text-captionc text-grey">
                {{ niceDate(post.date) }}
              </div>
            </q-card-section>
          </q-card>
        </template>
        <template v-else-if="!currentlyLoading && !posts.length">
          <h5 class="text-center text-grey">No posts yet!</h5>
        </template>
        <template v-else>
          <q-card flat bordered>
            <q-item>
              <q-item-section avatar>
                <q-skeleton type="QAvatar" animation="fade" size="40px" />
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <q-skeleton type="text" animation="fade" />
                </q-item-label>
                <q-item-label caption>
                  <q-skeleton type="text" animation="fade" />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-skeleton height="200px" square animation="fade" />

            <q-card-section>
              <q-skeleton type="text" class="text-subtitle2" animation="fade" />
              <q-skeleton
                type="text"
                width="50%"
                class="text-subtitle2"
                animation="fade"
              />
            </q-card-section>
          </q-card>
          <q-card flat bordered>
            <q-item>
              <q-item-section avatar>
                <q-skeleton type="QAvatar" animation="fade" size="40px" />
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <q-skeleton type="text" animation="fade" />
                </q-item-label>
                <q-item-label caption>
                  <q-skeleton type="text" animation="fade" />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-skeleton height="200px" square animation="fade" />

            <q-card-section>
              <q-skeleton type="text" class="text-subtitle2" animation="fade" />
              <q-skeleton
                type="text"
                width="50%"
                class="text-subtitle2"
                animation="fade"
              />
            </q-card-section>
          </q-card>
          <q-card flat bordered>
            <q-item>
              <q-item-section avatar>
                <q-skeleton type="QAvatar" animation="fade" size="40px" />
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <q-skeleton type="text" animation="fade" />
                </q-item-label>
                <q-item-label caption>
                  <q-skeleton type="text" animation="fade" />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-skeleton height="200px" square animation="fade" />

            <q-card-section>
              <q-skeleton type="text" class="text-subtitle2" animation="fade" />
              <q-skeleton
                type="text"
                width="50%"
                class="text-subtitle2"
                animation="fade"
              />
            </q-card-section>
          </q-card>
        </template>
      </div>
      <div class="col-4">
        <q-item class="fixed">
          <q-item-section avatar>
            <q-avatar>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-bold">{{ userName }}</q-item-label>
            <q-item-label caption>
              Add some friends to see who's online!</q-item-label
            >
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { date, useQuasar } from "quasar";
import axios from "axios";
import { computed } from "vue";
import { useUsernameStore } from "../stores/example-store";

export default defineComponent({
  name: "PageHome",
  setup() {
    const $q = useQuasar();
    const currentlyLoading = ref(false);
    const posts = ref([]);
    const loggedIn = ref(false);
    const userName = ref("");
    const store = useUsernameStore();

    const niceDate = (value) => {
      return date.formatDate(value, "MMMM D h:mmA YYYY");
    };

    const deletePost = async (postID) => {
      await axios
        .delete(`${process.env.API}/deletePost/${postID}`)
        .then((res) => {
          $q.notify({
            type: "positive",
            message: "Post deleted!",
          });
          getPosts();
        });
    };

    const getPosts = () => {
      currentlyLoading.value = true;
      axios
        .get(`${process.env.API}/posts`)
        .then((response) => {
          currentlyLoading.value = false;
          posts.value = response.data;
        })
        .catch((err) => {
          currentlyLoading.value = false;
          $q.dialog({
            title: "Error",
            message: "Could not reach image server",
          });
          console.log(err);
        });
    };

    onMounted(() => {
      getPosts();
    });

    return {
      posts,
      niceDate,
      currentlyLoading,
      getPosts,
      deletePost,
      loggedIn,
      store,
    };
  },
});
</script>

<style lang="sass">
.user-card
  .q-img
    min-height: 200px
</style>
