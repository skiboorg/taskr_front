<template>
  <q-page class="q-mt-xl">
    {{task_to_index}}
    {{from_column_index}}
      {{is_on_task_drop}}
    <div class="flex items-center q-mb-xl">
      <q-btn @click="$router.back()" icon="west" size="18px" class="q-mr-lg" round unelevated text-color="accent" color="grey-3"/>
      <p class="q-mb-none q-mr-xl fs-48 text-weight-bold">{{project.name}}</p>
      <q-btn label="Ссылка на проект" class="q-mr-md" icon-right="link" no-caps size="14px" rounded unelevated text-color="accent" color="grey-3"/>
      <q-btn label="Ссылка на сайт" icon-right="link"   no-caps size="14px" rounded unelevated text-color="accent" color="grey-3"/>
    </div>
    <div class="project-grid">
      <div class="project-column" :id="`column-${column_index}`" v-for="(column,column_index) in project.columns" :key="column_index"
          @drop='columnOnDrop($event, "tasks")'
          @dragover="columnDragOver"
           @dragleave="columnDragLeave">
        <div class="flex items-center justify-between q-mb-lg">
          <p class="no-margin fs-18 text-weight-bolder">{{column.name}}</p>
          <q-btn color="white"  text-color="grey-3" round flat >
            <svg width="30" height="7" viewBox="0 0 30 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="3" cy="3.5" r="3" fill="#D6D6D6"/>
              <circle cx="15" cy="3.5" r="3" fill="#D6D6D6"/>
              <circle cx="27" cy="3.5" r="3" fill="#D6D6D6"/>
            </svg>

            <q-menu auto-close :offset="[100, 10]">
              <q-list style="min-width: 100px">
                <q-item >
                  <q-item-section>Lorem ipsum.</q-item-section>
                </q-item>
                <q-item >
                  <q-item-section>Lorem ipsum Lorem ipsum.</q-item-section>
                </q-item>


              </q-list>
            </q-menu>
          </q-btn>
        </div>
        <div class="new-project q-mb-lg"
             @dragover.prevent
               @dragenter.prevent>
          <q-icon class="q-mr-md" name="add"  color="accent" size="24px"/>
          <p  class="text-accent fs-18 text-weight-medium no-margin full-width">Новая задача</p>
        </div>
        <div class="tasks">
          <div   class="task-wrapper" :ref="`task-item-${task.uid}`"

             v-for="(task,task_index) in column.tasks"
             :key="task_index"
             draggable="true"
             @dragstart="taskDragStart($event,column_index,task_index, task)">
            <div class="task" :id="`task-${task_index}`">
              <div class="task-inner">
                  <div class="flex items-center justify-between q-mb-md">
             <q-chip color="primary" class="q-pt-xs" size="14px" text-color="white" >{{task.tag}}</q-chip>
             <q-btn color="white"  text-color="grey-3" round flat >
            <svg width="30" height="7" viewBox="0 0 30 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="3" cy="3.5" r="3" fill="#D6D6D6"/>
              <circle cx="15" cy="3.5" r="3" fill="#D6D6D6"/>
              <circle cx="27" cy="3.5" r="3" fill="#D6D6D6"/>
            </svg>

            <q-menu auto-close :offset="[100, 10]">
              <q-list style="min-width: 100px">
                <q-item >
                  <q-item-section>Lorem ipsum.</q-item-section>
                </q-item>
                <q-item >
                  <q-item-section>Lorem ipsum Lorem ipsum.</q-item-section>
                </q-item>


              </q-list>
            </q-menu>
          </q-btn>
          </div>
          <p class="fs-24 text-weight-bolder">{{task.name}}</p>
          <p class="fs-16 text-weight-regular text-grey-6 q-mb-lg">{{task.description}}</p>
          <div class="flex items-center ">
            <div class="q-mr-md">
              <q-icon class="q-mr-sm" size="24px" color="grey-6" name="link"/>
              <span class="inline-block text-grey-6 fs-14 text-weight-bold">7</span>
            </div>
            <div class="q-mr-md">
              <q-icon class="q-mr-sm" size="24px" color="grey-6" name="chat_bubble_outline"/>
              <span class="inline-block text-grey-6 fs-14 text-weight-bold">7</span>
            </div>
             <div class="">
              <q-icon class="q-mr-sm" size="24px" color="grey-6" name="schedule"/>
              <span class="inline-block text-grey-6 fs-14 text-weight-bold">15 янв 2022</span>
            </div>
          </div>
              </div>

        </div>
        </div>
        </div>




      </div>
      <div class="new-project" @click="addColumn">
          <q-icon class="q-mr-md" name="add"  color="accent" size="24px"/>
          <p  class="text-accent fs-18 text-weight-medium no-margin full-width">Новая колонка</p>
        </div>
    </div>
  </q-page>
</template>
<script>
export default {
  data(){
    return{
      task_to_drag:null,
      task_to_index:null,
      from_column_index:null,
      is_on_task_drop:null,
      project:{
      }
    }
  },
  async beforeMount(){
    await this.getProject()
  },
  methods:{
    async getProject(){

      const response = await this.$api.get(`/api/data/project?name_slug=${this.$route.params.slug_name}`)
      this.project = response.data
    },
    addColumn(){
      this.project.columns.push({
        id:2,
        uid:new Date().getTime(),
        name: 'Новая колонка',
        tasks:[]
      })
    },
    taskDragStart(event,from_column_index,task_index,task){
     this.task_to_drag=task
     this.task_to_index=task_index
     this.from_column_index=from_column_index

    },

    columnOnDrop(event, list){
      let to_column

      if(event.toElement.className==='task'){
        console.log('to task',event)
        to_column = event.path[3].id.split('-')[1]
        console.log('target column',to_column)
        const target_task=event.toElement.id.split('-')[1]
        console.log('target_task',target_task)
        console.log('this.from_column_index',this.from_column_index)
        if (to_column===this.from_column_index){
          this.project.columns[this.from_column_index].tasks.splice(this.task_to_index,1)
        this.project.columns[this.from_column_index].tasks.splice(target_task,0,this.task_to_drag)
        }else {
          this.project.columns[this.from_column_index].tasks.splice(this.task_to_index,1)
        this.project.columns[to_column].tasks.splice(target_task,0,this.task_to_drag)
        }


      }else {
        console.log('on column drop',event)

        to_column = event.toElement.id.split('-')[1]
        console.log('target column',to_column)
         this.project.columns[to_column].tasks.push(this.task_to_drag)
      this.project.columns[this.from_column_index].tasks.splice(this.task_to_index,1)
      event.currentTarget.classList.add('ondropleave');
      event.currentTarget.classList.remove('ondrop');
      }






      this.task_to_drag=null
     this.task_to_index=null
     this.from_column_index=null



    },
    columnDragOver(event) {
      event.preventDefault();
      if (!event.currentTarget.classList.contains('ondrop')) {
        event.currentTarget.classList.remove('ondropleave');
        event.currentTarget.classList.add('ondrop');
      }
    },
    columnDragLeave(event) {
      event.currentTarget.classList.add('ondropleave');
      event.currentTarget.classList.remove('ondrop');
    },
  }
}
</script>
<style lang="sass">
.project-grid
  display: grid
  grid-auto-columns: 400px
  grid-auto-flow: column
  grid-gap: 40px
  overflow-x: auto
  margin: 0 -90px
  padding: 0 90px
  min-height: 100%


.project-column
  background: #FFFFFF
  box-shadow: 0px 14px 80px rgba(0, 0, 0, 0.05)
  border-radius: 30px
  flex-basis: 400px
  padding: 30px
  height: fit-content
  border: 1px dashed white
  transition: all .1s linear
  &.ondrop
    border-color: green
    padding-bottom: 250px
    & .new-project
      pointer-events: none
    & .task-inner
      pointer-events: none
  &.ondropleave
    border-color: white
    & .new-project
      pointer-events: all
    & .task-inner
      pointer-events: all
.task
  background: #F3F5FF
  border-radius: 30px
  padding: 30px

.tasks
  display: grid
  grid-template-columns: 1fr
  grid-gap: 40px
</style>
