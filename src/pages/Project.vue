<template>
  <q-page class="">

    <div class="flex items-center q-mb-xl">
      <q-btn @click="$router.back()" icon="west" size="18px" class="q-mr-lg" round unelevated text-color="accent" color="grey-3"/>
      <p class="q-mb-none q-mr-xl fs-48 text-weight-bold">{{project.name}}</p>
      <div class="">
        <q-btn v-if="$auth.user.is_superuser" class="q-mr-md" icon="add_link"  size="16px" round unelevated text-color="accent" color="grey-3"/>
        <q-popup-edit ref="addlink" v-model="new_link" auto-save v-slot="scope">
          <q-input class="q-mb-sm" rounded outlined v-model="newLink.name" dense autofocus label="Название" />
          <q-input class="q-mb-sm" rounded outlined v-model="newLink.link" dense autofocus label="Ссылка" />
          <div class="flex items-center justify-between">
            <q-btn rounded color="grey-3" dense  text-color="dark" v-close-popup style="flex-basis: 49%" label="Отмена" no-caps size="14px" unelevated/>
            <q-btn rounded color="primary" dense @click="addLink" label="Добавить" style="flex-basis: 49%" no-caps size="14px" unelevated/>

          </div>
        </q-popup-edit>
      </div>

      <q-btn :label="link.name"
             v-for="link in project.links"
             :href="link.link"
             target="_blank"
             :key="link.id"
             class="q-mr-md project-link" icon-right="link" no-caps size="14px" rounded unelevated text-color="accent" color="grey-3">
<q-badge v-if="$auth.user.is_superuser" @click.prevent="delLink(link.id)" floating color="negative"><q-icon size="10px" name="close"/></q-badge>
      </q-btn>

    </div>
    <div class="project-grid">

      <div class="project-column" :id="`column-${column_index}`" v-for="(column,column_index) in project.columns" :key="column_index"
           @drop='columnOnDrop($event, "tasks")'
           @dragover="columnDragOver"
           @dragleave="columnDragLeave">
        <div class="flex items-center justify-between q-mb-lg">
          <p style="flex-basis: 80%;outline: 0"
             class="no-margin fs-18 text-weight-bolder"
             @keyup="columnNameInput"
             :id="`column${column_index}`"
             :ref="`column${column_index}`"
             :contenteditable="edit_column_name_index===column_index">{{column.name}}</p>
          <q-btn v-if="$auth.user.is_superuser" color="white"  text-color="grey-3" round flat >
            <svg width="30" height="7" viewBox="0 0 30 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="3" cy="3.5" r="3" fill="#D6D6D6"/>
              <circle cx="15" cy="3.5" r="3" fill="#D6D6D6"/>
              <circle cx="27" cy="3.5" r="3" fill="#D6D6D6"/>
            </svg>
            <q-menu auto-close :offset="[100, 10]">
              <q-list style="min-width: 100px">
                <q-item clickable @click="editColumn(column_index)">
                  <q-item-section>Редактировать название</q-item-section>
                </q-item>
                <q-separator/>
                <q-item class="text-negative" clickable @click="deleteColumn(column.id)">
                  <q-item-section  class="text-negative">Удалить колонку</q-item-section>
                </q-item>


              </q-list>
            </q-menu>
          </q-btn>
        </div>
        <div v-if="$auth.user.is_superuser" class="new-project q-mb-lg"
             @click="column_id_to_add_task = column.id,newTaskModal = !newTaskModal"
             @dragover.prevent
             @dragenter.prevent>
          <q-icon class="q-mr-md" name="add"  color="accent" size="24px"/>
          <p  class="text-accent fs-18 text-weight-medium no-margin full-width">Новая задача</p>
        </div>
        <div class="tasks">
          <div   class="task-wrapper relative-position" :ref="`task-item-${task.uid}`"
                 v-for="(task,task_index) in column.tasks"
                 :key="task_index"
                 draggable="true"
                 @dragstart="taskDragStart($event,column_index,task_index, task)">
             <q-badge v-if="task.is_proger_task" :color="task.is_new ? 'red' : 'primary'" floating :label="task.is_new ? 'Новая задача прогеру' : 'Задача прогеру'"/>
             <q-badge v-if="task.is_designer_task" :color="task.is_new ? 'red' : 'primary'" floating :label="task.is_new ? 'Новая задача дизайнеру' : 'Задача дизайнеру'"/>

            <div class="task" :class="{'is-done':task.is_done}" :id="`task-${task_index}`">
              <div class="task-inner">
                <div class="flex items-center justify-between q-mb-md">
                  <q-chip :color="task.tag.color" class="q-pt-xs" size="14px" text-color="white" >{{task.tag.name}}</q-chip>
                  <q-btn color="white"  text-color="grey-3" round flat >
                    <svg width="30" height="7" viewBox="0 0 30 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="3" cy="3.5" r="3" fill="#D6D6D6"/>
                      <circle cx="15" cy="3.5" r="3" fill="#D6D6D6"/>
                      <circle cx="27" cy="3.5" r="3" fill="#D6D6D6"/>
                    </svg>

                    <q-menu auto-close :offset="[100, 10]">
                      <q-list style="min-width: 100px">
                        <q-item clickable @click="currentTask=task, taskInfoModal=true">
                          <q-item-section>Открыть задачу</q-item-section>
                        </q-item>
                        <q-item v-if="$auth.user.is_superuser" clickable @click="editTask(task)">
                          <q-item-section>Редактировать задачу</q-item-section>
                        </q-item>
                        <q-item clickable @click="taskDone(task)">
                          <q-item-section class="text-positive">Задача выполнена</q-item-section>
                        </q-item>
                        <q-separator v-if="$auth.user.is_superuser" />
                        <q-item v-if="$auth.user.is_superuser" clickable @click="deleteTask(task.id,column_index,task_index)">
                          <q-item-section class="text-negative">Удалить задачу</q-item-section>
                        </q-item>


                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
                <p class="fs-24 text-weight-bolder cursor-pointer" @click="currentTask=task, taskInfoModal=true">{{task.name}}</p>
                <p class="fs-16 text-weight-regular text-grey-6 q-mb-lg">{{task.description}}</p>
                <div class="flex items-center ">
                  <div class="q-mr-md">
                    <q-icon class="q-mr-sm" size="24px" color="grey-6" name="link"/>
                    <span class="inline-block text-grey-6 fs-14 text-weight-bold">{{task.files.length}}</span>
                  </div>
                  <div class="q-mr-md">
                    <q-icon class="q-mr-sm" size="24px" color="grey-6" name="chat_bubble_outline"/>
                    <span class="inline-block text-grey-6 fs-14 text-weight-bold">{{task.comments.length}}</span>
                  </div>
                  <div class="">
                    <q-icon class="q-mr-sm" size="24px" color="grey-6" name="schedule"/>
                    <span class="inline-block text-grey-6 fs-14 text-weight-bold">{{new Date(task.dead_line).toLocaleString("ru",{year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timezone: 'UTC'})}}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <div v-if="$auth.user.is_superuser" class="new-project" @click="addColumn">
        <q-icon class="q-mr-md" name="add"  color="accent" size="24px"/>
        <p  class="text-accent fs-18 text-weight-medium no-margin full-width">Новая колонка</p>
      </div>

    </div>
  </q-page>
  <q-dialog v-model="newTaskModal">
    <q-card class="task bg-white" style="width: 400px; max-width: 100vw;">
      <q-card-section class="row items-center no-padding q-mb-md">
        <div class="text-h6">{{is_task_edit_mode ? 'Редактирование задачи' : 'Новая задача'}}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="no-padding">
        <q-form @submit.prevent="newTaskFormSubmit">
          <div class="q-mb-sm tag-select">
            <p class="q-mb-sm">Задача для</p>
          <q-checkbox v-model="taskData.is_proger" label="Прогера" />
          <q-checkbox v-model="taskData.is_designer" label="Дизайнера" />
          </div>

          <q-input class="q-mb-sm" rounded outlined  v-model="taskData.name" label="Название задачи" />
          <q-input class="q-mb-sm" type="textarea" rounded outlined  v-model="taskData.description" label="Описание задачи" />
          <div class="flex items-center tag-select q-mb-sm">
            <p class="q-mb-none q-mr-sm fs-16 text-grey-7">Теги:</p>
            <q-btn :color="taskData.tag.id === tag.id ? tag.color : `${tag.color}-3`"
                   class="q-pt-xs q-mr-sm"
                   size="14px"
                   text-color="white"
                   @click="taskData.tag = tag"
                   v-for="tag in tags"
                   :key="tag.id"
                   :label="tag.name"
                   unelevated
                   no-caps
                   rounded

            />

          </div>
          <div v-if="taskFiles.length>0" class="tag-select">
            <p class="q-mb-none">Добавленные файлы</p>
            <div class="flex items-center justify-between" v-for="(file,index) in taskFiles" :key="index">
              <p class="no-margin text-caption text-grey-7">{{file.name}}</p>
              <q-btn icon="delete" @click="deleteFile(index)" round flat dense size="12px"/>
            </div>
          </div>
          <div class="q-mb-md">

            <p class="q-mb-none link cursor-pointer">Добавить файл</p>
            <q-popup-edit v-model="pedit" ref="pedit" >
              <q-input class="q-mb-sm" rounded outlined v-model="file_to_add.name" dense autofocus label="Название файла" />
              <q-file class="q-mb-md" rounded outlined v-model="file_to_add.file" dense autofocus label="Файл" />
              <div class="flex items-center justify-between">
                <q-btn rounded color="grey-3" dense  text-color="dark" v-close-popup style="flex-basis: 49%" label="Отмена" no-caps size="14px" unelevated/>
                <q-btn rounded color="primary" dense @click="addFile" label="Прикрепить" style="flex-basis: 49%" no-caps size="14px" unelevated/>

              </div>
            </q-popup-edit>
          </div>

          <q-input readonly class="q-mb-lg" rounded outlined v-model="taskData.dead_line"  label="Срок исполнения">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="taskData.dead_line" :first-day-of-week="1" mask="DD MMMM YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Выбрать" no-caps color="primary" rounded flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <div class="flex items-center justify-between">
            <q-btn rounded color="grey-3" :loading="is_loading" text-color="dark" v-close-popup style="flex-basis: 49%" label="Отмена" no-caps size="18px" unelevated/>
            <q-btn rounded color="primary"
                   :loading="is_loading"
                   type="submit"
                   label="Создать задачу"
                   :disable="!taskData.dead_line || !taskData.name"
                   no-caps
                   size="18px"
                   unelevated/>

          </div>

        </q-form>
      </q-card-section>



    </q-card>
  </q-dialog>
  <q-dialog v-model="taskInfoModal" @before-show="taskOpen">
    <q-card class="task bg-white" style="width: 400px; max-width: 100vw;">
      <q-card-section class="row items-center no-padding q-mb-md">
        <div class="text-h6">Детали задачи</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section class="no-padding">
        <div class="task q-mb-md">
          <div class="flex items-center justify-between q-mb-md">
            <q-chip color="primary" class="q-pt-xs" size="14px" text-color="white" >{{currentTask.tag.name}}</q-chip>
            <q-btn v-if="$auth.user.is_superuser" color="white"  text-color="grey-3" round flat >
              <svg width="30" height="7" viewBox="0 0 30 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="3" cy="3.5" r="3" fill="#D6D6D6"/>
                <circle cx="15" cy="3.5" r="3" fill="#D6D6D6"/>
                <circle cx="27" cy="3.5" r="3" fill="#D6D6D6"/>
              </svg>
              <q-menu auto-close :offset="[100, 10]">
                <q-list style="min-width: 100px">
                  <q-item clickable >
                    <q-item-section>Завершить задачу</q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section>Редактировать задачу</q-item-section>
                  </q-item>
                  <q-separator/>
                  <q-item clickable @click="deleteTask(task.id,column_index,task_index)">
                    <q-item-section class="text-negative">Удалить задачу</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <p class="fs-24 text-weight-bolder cursor-pointer" >{{currentTask.name}}</p>
          <p class="fs-16 text-weight-regular text-grey-6 q-mb-lg">{{currentTask.description}}</p>
          <div class="flex items-center ">
            <div class="q-mr-md">
              <q-icon class="q-mr-sm" size="24px" color="grey-6" name="link"/>
              <span class="inline-block text-grey-6 fs-14 text-weight-bold">{{currentTask.files.length}}</span>
            </div>
            <div class="q-mr-md">
              <q-icon class="q-mr-sm" size="24px" color="grey-6" name="chat_bubble_outline"/>
              <span class="inline-block text-grey-6 fs-14 text-weight-bold">7</span>
            </div>
            <div class="">
              <q-icon class="q-mr-sm" size="24px" color="grey-6" name="schedule"/>
              <span class="inline-block text-grey-6 fs-14 text-weight-bold">{{new Date(currentTask.dead_line).toLocaleString("ru",{year: 'numeric',
                month: 'long',
                day: 'numeric',
                timezone: 'UTC'})}}</span>
            </div>
          </div>
        </div>
        <div class="task q-mb-md">
          <div class="flex items-center justify-between" v-for="(file,index) in currentTask.files" :key="index">
            <p class="no-margin text-grey-7">{{file.name}}</p>
            <a :href="file.file"  target="_blank"><q-icon size="24px" color="grey-7" name="cloud_download"/></a>
          </div>
        </div>
        <div class="task-comments q-mb-md">
          <q-scroll-area style="height: 200px;"
                         :thumb-style="thumbStyle"
                          :bar-style="barStyle">
     <div class="task-comment q-mb-md" v-for="(comment,i) in currentTask.comments" :key="i">

            <div class="flex items-center justify-between q-mb-sm">
               <p class="no-margin text-weight-medium text-primary">{{comment.user.fio}}</p>
               <p class="no-margin text-weight-medium">{{new Date(comment.created_at).toLocaleString()}}</p>
            </div>
            <p>{{comment.text}}</p>
          </div>
    </q-scroll-area>

        </div>
        <q-input borderless bg-color="white" @keyup="inputHandler" v-model="message" label="Напишите комментарий..." />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script>
export default {
  data(){
    return{
      message:null,
      thumbStyle: {
        right: '0px',
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '2px',
        opacity: 0.75
      },

      barStyle: {
        right: '-3px',
        borderRadius: '9px',
        backgroundColor: '#027be3',
        width: '5px',
        opacity: 0.2
      },
      is_loading:false,
      is_task_edit_mode:false,
      newTaskModal:false,
      taskInfoModal:false,
      currentTask:null,
      new_link:null,
      column_id_to_add_task:null,
      date:null,
      pedit:null,
      new_tasks_order:[],
      newLink:{
        name:null,
        link:null
      },
      taskData:{
        name:null,
        description:null,
        tag:null,
        dead_line:null,
        is_proger:true,
        is_designer:false
      },
      file_to_add:{
        name:null,
        file:null
      },
      taskFiles:[],
      edit_column_name_index:null,
      task_to_drag:null,
      task_to_index:null,
      from_column_index:null,
      is_on_task_drop:null,
      project:{
      },
      tags:[]
    }
  },
  async beforeMount(){
    await this.getProject()
    const response = await this.$api.get(`/api/data/tags`)
    this.tags = response.data
    this.taskData.tag = this.tags[0]

  },
  methods:{
    async taskOpen(){

      if(this.$auth.user.is_proger && this.currentTask.is_proger_task){
        await this.$api.post(`/api/data/task_view`,{id:this.currentTask.id})
        this.currentTask.is_new = false
      }

      if(this.$auth.user.is_desiner && this.currentTask.is_designer_task){
        await this.$api.post(`/api/data/task_view`,{id:this.currentTask.id})
        this.currentTask.is_new = false
      }

    },
    async inputHandler(val){
      if (val.keyCode===13){

        this.currentTask.comments.push(
          {
            "user": { "id": this.$auth.user.id, "fio": this.$auth.user.fio},
            "text": this.message,
            "created_at": new Date(),
            "task": this.currentTask.id }
        )
        await this.$api.post(`/api/data/add_task_comment`,{
          task_id:this.currentTask.id,
          text:this.message
        })
        this.message = null
      }
    },
    editTask(task){
      this.is_task_edit_mode = true
      this.taskData = task
      this.taskFiles = task.files
      // this.taskData.dead_line = new Date(this.taskData.dead_line).toLocaleString("ru",{year: 'numeric',
      //                 month: 'long',
      //                 day: 'numeric',
      //                 timezone: 'UTC'}).replace(' г.','')
      this.newTaskModal = true
      console.log(this.taskFiles)
    },
    async deleteTask(id,column_index,task_index){
      this.project.columns[column_index].tasks.splice(task_index,1)
      await this.$api.post(`/api/data/delete_task`,{id})
    },
    deleteFile(index){
      this.taskFiles.splice(index,1)
    },
    async taskDone(task){
      task.is_done=true
      await this.$api.post(`/api/data/task_done`,{id:task.id})
    },
    async delLink(id){
      await this.$api.post(`/api/data/del_project_link`,{id})
      await this.getProject()
    },
    async addLink(){
       await this.$api.post(`/api/data/add_project_link`,{
         id:this.project.id,
         name:this.newLink.name,
         link:this.newLink.link
       })
      this.newLink = {
         name:null,
         link:null
      }
      await this.getProject()
      this.$refs.addlink.hide()
    },
    addFile(){
      this.taskFiles.push(this.file_to_add)
      this.file_to_add = {
        name:null,
        file:null
      }
      this.$refs.pedit.hide()
    },
    async newTaskFormSubmit(){
      this.is_loading = !this.is_loading
      let formData = new FormData()
      formData.set('c_id',this.column_id_to_add_task)
      formData.set('p_id',this.project.id)
      formData.set('data',JSON.stringify(this.taskData))
      if(this.taskFiles.length>0){
        for(let i of this.taskFiles){
          formData.append('file_names', i.name)
          formData.append('files', i.file)
        }
      }

      await this.$api({
        method: 'post',
        headers:{
          'content-type': 'multipart/form-data'
        },
        url: '/api/data/add_task',
        data: formData
      })

      this.newTaskModal = false
      await this.getProject()
      this.is_loading = !this.is_loading
    },
    async columnNameInput(val){
      if (val.keyCode===13){
        await this.$api.post(`/api/data/edit_column`,{
          c_id:this.project.columns[this.edit_column_name_index].id,
          name:this.$refs[`column${this.edit_column_name_index}`][0].innerText}
        )
        this.edit_column_name_index = null
        await this.getProject()
      }
    },
    async getProject(){
      const response = await this.$api.get(`/api/data/project?name_slug=${this.$route.params.slug_name}`)
      this.project = response.data
    },
    async addColumn(){
      await this.$api.post(`/api/data/add_column`,{p_id:this.project.id})
      await this.getProject()
    },
    async deleteColumn(c_id){
      await this.$api.post(`/api/data/delete_column`,{c_id})
      await this.getProject()
    },
    editColumn(c_index){
      this.edit_column_name_index = c_index
      this.$refs[`column${c_index}`][0].focus()
    },
    taskDragStart(event,from_column_index,task_index,task){
      this.task_to_drag=task
      this.task_to_index=task_index
      this.from_column_index=from_column_index

    },

    async columnOnDrop(event, list){
      let to_column

      if(event.toElement.className==='task'){
        this.new_tasks_order = []
        console.log('to task',event)
        to_column = event.path[3].id.split('-')[1]
        //console.log('target column',to_column)
        const target_task=event.toElement.id.split('-')[1]
        //console.log('target_task',target_task)
        //console.log('this.from_column_index',this.from_column_index)
        if (to_column===this.from_column_index){
          this.project.columns[this.from_column_index].tasks.splice(this.task_to_index,1)
          this.project.columns[this.from_column_index].tasks.splice(target_task,0,this.task_to_drag)
        }else {
          this.project.columns[this.from_column_index].tasks.splice(this.task_to_index,1)
          this.project.columns[to_column].tasks.splice(target_task,0,this.task_to_drag)
        }
        console.log(this.project.columns[to_column].tasks)
        //this.new_tasks_order.column = this.project.columns[to_column].id
        for(const [i,x] of this.project.columns[to_column].tasks.entries()){

          this.new_tasks_order.push({id:x.id,order:`c${this.project.columns[to_column].id}t${i+1}`})
        }
        console.log(this.new_tasks_order)
        event.currentTarget.classList.add('ondropleave');
        event.currentTarget.classList.remove('ondrop');
        await this.$api.post('/api/data/reorder_tasks',{tasks:this.new_tasks_order})
      }else {
        console.log('on column drop',event)

        to_column = event.toElement.id.split('-')[1]
        console.log('target column',to_column)
        this.project.columns[to_column].tasks.push(this.task_to_drag)
        this.project.columns[this.from_column_index].tasks.splice(this.task_to_index,1)
        event.currentTarget.classList.add('ondropleave');
        event.currentTarget.classList.remove('ondrop');
        await this.$api.post('/api/data/move_task_to_col',{to_column_id:this.project.columns[to_column].id,task_id:this.task_to_drag.id})
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
*[contenteditable="true"]
  position: relative
  background: $grey-3
  padding: 5px
  &:focus-visible
    border: 1px solid $primary
    border-radius: 5px
    &::after
      content: none
  &::after
    position: absolute
    content: ''
    width: 1px
    height: 78%
    top: 4px
    background: $dark
    animation-name: blink
    animation-duration: 1s
    animation-iteration-count: infinite
    animation-timing-function: ease

@keyframes blink
  0%
    opacity: 1
  100%
    opacity: 0

.project-grid
  display: grid
  grid-auto-columns: 400px
  grid-auto-flow: column
  grid-gap: 40px
  overflow-y: hidden
  margin: 0 -90px
  padding: 0 90px
  min-height: 79vh
  height: fit-content




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
  border-radius: 30px !important
  padding: 30px
  &.is-done
    background: #EBFDEE
  &-comments
    border: 2px solid #F3F5FF
    box-sizing: border-box
    border-radius: 30px
    padding: 20px

.tasks
  display: grid
  grid-template-columns: 1fr
  grid-gap: 40px
.tag-select
  background: #F4F6F9
  border-radius: 15px
  padding: 12px
.project-link
  position: relative
  z-index: 1
  &:hover
    & .delete-link
      opacity: 1
.delete-link
  position: absolute
  z-index: 100

  right: 0
  opacity: 0
  pointer-events: none
</style>
