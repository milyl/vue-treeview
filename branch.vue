<template lang="pug">
  ul.node
    li
      transition(name="modal")
        .modal-mask(v-show="creating", @click.self="cancel")
          .modal-container
            .modal-content
              h1 Create New Node
              form(@keyup.enter="save", @submit.prevent)
                input(type="text", v-model="newNode.text", placeholder="Folder name")
                .btn-group
                  button(type="button", @click="cancel").cancel Cancel
                  button(type="button", @click="save").save Save
      transition(name="modal")
        .modal-mask(v-show="editing", @click.self="cancel")
          .modal-container
            .modal-content
              h1 Edit Node
              form(@keyup.enter="edit")
                input(type="text", v-model="text", placeholder="Text: Google")
                input(type="text", v-model="link.type", hidden, placeholder="Type: link")
                template(v-show="link.type === 'router-link'")
                  input(type="text", v-model="link.key", hidden, placeholder="Key: path or name")
                input(type="text", v-model="link.value", hidden, placeholder="Value: https://www.google.com")
                .btn-group
                  button(type="button", @click.prevent="remove").remove Delete
                  button(type="button", @click.prevent="cancel").cancel Cancel
                  button(type="button", @click.prevent="edit").save Edit
      .branch(:class="{ link: (nodes.length > 0), active: activeNode == id ? 1 : 0 }")
        template(v-if="nodes.length > 0")
          template(v-if="open")
            fa(:icon="opened", @click="createNewNode").minus-square
          template(v-else)
            fa(:icon="closed", @click="createNewNode").plus-square

        template(v-if="link && link.value")
          a(@click="emitEvent({id: id, value: link.value})", v-if="link.type === 'router-link'").cursor-pointer
            fa(:icon="defaultIcon", v-show="showParentIcon.parentShow")
            | {{ text }}

          a(:href="link.value", target="_blank", v-else-if="link.type === 'link'").value
            fa(:icon="defaultIcon", v-show="showParentIcon.parentShow")
            | {{ text }}

          .branch-actions(v-if="editable")
            span(@click="creating = true", v-show="editable").create-btn
                fa(icon="folder-plus")
            span(v-if="id != '0'", @click="editing = true", v-show="editable").edit-btn
                fa(icon="pen")
        template(v-else)
          span(v-if="nodes.length > 0")
            fa(:icon="defaultIcon", v-show="showParentIcon.parentShow")
            | {{ text }}

          span(@click="createNewNode", v-else)
            fa(:icon="defaultIcon", v-show="showParentIcon.emptyParentShow")
            | {{ text }}

      draggable(
        :list="nodes",
        :group="{ name: 'g1', pull: false, put: true }",
        :sort="false",
        direction='vertical',
        v-if="draggable",
        draggable=".node"
      )
        branch(
          v-for="(t, i) in nodes",
          :nodes.sync="t.nodes",
          :text.sync="t.text",
          :type="t.type",
          :id="t.id",
          :link="t.link",
          :class="{ open: open, first: i === 0 && !checkLast(i), last: checkLast(i) }",
          v-if="nodes",
          :closed="closed",
          :opened="opened",
          :defaultIcon="t.icon || defaultIcon",
          :editable="editable",
          :expanded.sync="expanded",
          :draggable.sync="draggable",
          :show-parent-icon="showParentIcon",
          :active-node.sync="activeNode",
          :key="t.id"
          @node-clicked="emit('node-clicked',$event)",
          @node-changed="emit('node-changed',$event)"
        ).node
      template(v-else)
        branch(
          v-for="(t, i) in nodes",
          :nodes.sync="t.nodes",
          :text.sync="t.text",
          :type="t.type",
          :link="t.link",
          :id="t.id",
          :class="{ open: open, first: i === 0 && !checkLast(i), last: checkLast(i)}",
          v-if="nodes",
          :closed="closed",
          :opened="opened",
          :defaultIcon="t.icon || defaultIcon",
          :editable="editable",
          :expanded.sync="expanded",
          :draggable.sync="draggable",
          :show-parent-icon="showParentIcon",
          :active-node.sync="activeNode",
          :key="t.id",
          @node-clicked="emit('node-clicked',$event)",
          @node-changed="emit('node-changed',$event)"
        ).node
</template>

<script>
  import draggable from 'vuedraggable'
  export default {
    name: 'Branch',
    props: {
      id: {
        type: String,
        required: false,
        default: () => null
      },
      text: {
        type: String,
        required: true,
        default: () => ''
      },
      nodes: {
        type: Array,
        default: () => []
      },
      type: {
        type: String,
        default: () => ''
      },
      link: {
        type: Object,
        default: () => ({})
      },
      closed: {
        type: String | Object | Array
      },
      opened: {
        type: String | Object | Array
      },
      defaultIcon: {
        type: String | Object | Array
      },
      editable: {
        type: Boolean,
        default: () => true
      },
      expanded: {
        type: Boolean,
        default: () => false
      },
      draggable: {
        type: Boolean,
        default: () => true
      },
      showParentIcon: {
        type: Object,
        default: () => ({
          parentShow: false,
          emptyParentShow: false,
        })
      },
      activeNode: {
        type: String,
      }

    },
    data: () => ({
      open: false,
      clicks: 0,
      timer: null,
      newNode: {
        text: '',
        link: {
          type: 'router-link',
          key: 'path',
          value: ''
        },
        id: "new",
      },
      creating: false,
      editing: false,
      urlRegex: new RegExp(/^(https?:\/\/)?(www\.|[a-z\d]+\.)?[a-z]+(\.[a-z]{2,3}|:\d{2,5})(\.[a-z]{2,3})?(\/([\w\d]+)?)*((\?|&)[\w\d]+=[\w\d]+)*/)
    }),
    watch: {
      expanded: {
        handler: function (val) {
          this.open = val
        },
        immediate: true
      }
    },
    methods: {
      createNewNode () {
        if (this.editable) {
          this.clicks++
          if (this.clicks === 1) {
            const app = this
            this.timer = setTimeout(() => {
              app.toggle()
              app.clicks = 0
            }, 250);
          } else {
            clearTimeout(this.timer)
            this.clicks = 0
            this.creating = true
          }
        } else {
          this.toggle()
        }
      },
      remove () {
          this.creating = false
          this.editing = false
          const data = {
                parent_id: this.id ? this.id : null,
                action: 'delete',
                name: this.text
          }
          this.$emit("node-changed", data)
      },
      cancel () {
        this.creating = false
        this.editing = false
        this.newNode = {
          text: '',
          link: {
            type: 'router-link',
            key: 'path',
            value: ''
          },
          id: "new"
        }
      },
      edit () {
        const data = {
            name: this.text,
            parent_id: this.id ? this.id : null,
            action: 'edit'
        }
        this.editing = false
        const path = this.link.value
        this.link.value = path.slice(0, path.lastIndexOf('/')) + '/' + this.text
        this.$emit('nodes', this.nodes)
        this.$emit("node-changed", data)
      },
      save () {
          const data = {
              name: this.newNode.text,
              parent_id: this.id ? this.id : null,
              action: 'create'
          }
          if(this.newNode.text.length){
              const query = this.newNode.text.replace(/([a-z])([A-Z])([0-9])/g, "$1-$2").replace(/\s+/g, '-').toLowerCase();
              this.newNode.link = {
                  type: 'router-link',
                  key: 'path',
                  value: this.link.value + '/' + query,
              }
            this.nodes.push(this.newNode)
            this.creating = false
            this.newNode = {
              text: '',
              link: {
                  type: 'router-link',
                  key: 'path',
                  value: '',
              },
              id: "1",
            }
            this.$emit("node-changed", data)
            this.$emit('nodes', this.nodes)
          }
      },
      toggle () {
        this.open = !this.open
      },
      checkLast (i) {
        return (i + 1) === this.nodes.length
      },
      emit(event, data){
          this.$emit(event, data)
      },
      emitEvent(val){
          this.$emit("node-clicked", val)
      }
    },
    components: {
      draggable
    }
  }
</script>