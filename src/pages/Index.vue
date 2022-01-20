<template>
  <q-page class="q-mt-xl">
    <p class="q-mb-lx fs-48 text-weight-bold">Проекты</p>

    <p v-if="projects.length===0" class="text-accent fs-24 text-weight-medium">Проектов пока нет. Создайте проект для начала работы</p>
    <div class="projects-grid">
      <div class="project"  v-for="project in projects" :key="project.id">
        <q-img
          @click="$router.push(`/projects/${project.name_slug}`)"
          :src="project.image_mob"
          spinner-color="primary"
          style="height: 188px; max-width: 100%;border-radius: 15px;"
          class="q-mb-md cursor-pointer"
        />
        <div class="flex items-center justify-between">
          <p class="no-margin text-weight-medium fs-18 cursor-pointer" @click="$router.push(`/projects/${project.name_slug}`)">{{project.name}}</p>
          <q-btn color="white"  text-color="grey-3" round flat >
            <svg width="30" height="7" viewBox="0 0 30 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="3" cy="3.5" r="3" fill="#D6D6D6"/>
              <circle cx="15" cy="3.5" r="3" fill="#D6D6D6"/>
              <circle cx="27" cy="3.5" r="3" fill="#D6D6D6"/>
            </svg>

            <q-menu auto-close :offset="[100, 10]">
              <q-list style="min-width: 100px">
                <q-item clickable @click="deleteProject(project.id)">
                  <q-item-section>Удалить</q-item-section>
                </q-item>



              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
      <div class="new-project" :class="{'newProjectActive' : newProjectActive}" >
        <q-icon v-if="!newProjectActive" class="q-mr-md" name="add" @click="newProjectActive=true" color="accent" size="24px"/>
        <p v-if="!newProjectActive" @click="newProjectActive=true" class="text-accent fs-18 text-weight-medium no-margin full-width">Новый проект</p>
        <q-form v-if="newProjectActive">
          <q-input class="q-mb-sm full-width" rounded outlined   v-model="newProjectData.title" label="Название проекта" />
          <q-file v-if="!newProjectData.file" class="q-mb-md full-width" rounded outlined   v-model="newProjectData.file" label="Обложка проекта" >
            <template v-slot:append>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          <div v-else class="q-mb-lg">
            <q-img
              :src="imageUrl"
              spinner-color="primary"
              style="height: 200px; max-width: 100%;border-radius: 15px;"
              class="q-mb-sm"
            />
            <p class="q-mb-none text-accent fs-16 text-weight-medium cursor-pointer" @click="newProjectData.file = null">Обновить обложку</p>
          </div>

          <div class="flex items-center justify-between">
            <q-btn rounded color="grey-3" :loading="is_loading" text-color="dark" @click="newProjectActive=false" style="flex-basis: 49%" label="Отмена" no-caps size="18px" unelevated/>
            <q-btn rounded color="primary" :loading="is_loading" @click="newProject" style="flex-basis: 49%" label="Создать проект" no-caps size="18px" unelevated/>
          </div>
        </q-form>
      </div>
    </div>

  </q-page>
</template>

<script>


export default {
  data(){
    return{
      newProjectActive:false,
      is_loading:false,
      imageUrl:null,
      newProjectData:{
        title:null,
        file:null
      },
      projects:[]
    }
  },
  async beforeMount(){
    await this.getProjects()
  },
  watch:{
    'newProjectData.file'(val){
      val !==null ?
        this.imageUrl = URL.createObjectURL(this.newProjectData.file) :
        this.imageUrl = null
    }
  },
  methods:{
    updateFile(){
      console.log(this.newProjectData.file)
      this.imageUrl = URL.createObjectURL(this.newProjectData.file.value)
      console.log(this.imageUrl)
    },
    async getProjects(){
      const response = await this.$api.get('/api/data/projects')
      this.projects = response.data
    },
    async deleteProject(id){
      await this.$api.post('/api/data/delete_project',{id})
      await this.getProjects()
    },
    async newProject(){
      this.is_loading = !this.is_loading
      let formData = new FormData()
      formData.set('image',this.newProjectData.file)
      formData.set('name',this.newProjectData.title)
      await this.$api({
        method: 'post',
        headers:{
          'content-type': 'multipart/form-data'
        },
        url: '/api/data/new_project',
        data: formData
      })

      await this.getProjects()
      this.imageUrl = null
      this.newProjectData={
        title:null,
        file:null
      }
      this.newProjectActive = false
      this.is_loading = !this.is_loading
    },
  }
}
</script>
<style lang="sass">
.project
  background: #FFFFFF
  box-shadow: 0px 14px 80px rgba(0, 0, 0, 0.05)
  border-radius: 30px
  padding: 30px
  height: fit-content
.projects-grid
  display: grid
  grid-template-columns: repeat(auto-fill,minmax(375px,1fr))
  grid-gap: 40px


</style>
