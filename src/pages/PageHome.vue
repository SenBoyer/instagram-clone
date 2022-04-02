<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
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
              <q-item-label class="text-bold">USERNAME</q-item-label>
              <q-item-label caption> {{ post.location }} </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />
          <q-img :src="post.imgUrl" />
          <q-card-section>
            <div>{{ post.caption }}</div>
            <div class="text-captionc text-grey">{{ niceDate(post.date) }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-4">
        <q-item class="fixed">
          <q-item-section avatar>
            <q-avatar>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-bold">USERNAME</q-item-label>
            <q-item-label caption> CAPTION SECTION</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { date } from "quasar";

export default defineComponent({
  name: "PageHome",
  setup() {
    const posts = ref([
      {
        id: 1,
        caption: "Golden Gate Bridge",
        date: Date.now(),
        location: "San Fransisco, US",
        imgUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
      },
      {
        id: 2,
        caption: "Golden Gate Bridge",
        date: Date.now(),
        location: "Location 2",
        imgUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
      },
      {
        id: 3,
        caption: "Golden Gate Bridge",
        date: Date.now(),
        location: "Location 3",
        imgUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
      },
    ]);

    const niceDate = (value) => {
      return date.formatDate(value, "MMMM D h:mmA");
    };

    return { posts, niceDate };
  },
});
</script>

<style lang="sass">
.user-card
  .q-img
    min-height: 200px
</style>
