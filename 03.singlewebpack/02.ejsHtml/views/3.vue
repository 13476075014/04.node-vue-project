<!-- 会员管理 -->
<template>
  <div class="app-container">
    <!-- 搜索组件 -->
    <div class="filter-container">
      <search-box
        :select-search="selectSearch"
        :btn-group="btnGroup"
        :show-reviewer="showReviewer"
        :download-loading="downloadLoading"
        :search-config="searchConfig"
        :list-query="listQuery"
        @handleFilter="handleFilter"
        @handleReset="handleReset"
        @handleFlush="handleFlush"/>
    </div>

    <div class="btnOut">
      <!-- 下载发票的元素，不需要展示，只需要这个功能 -->
      <a ref="downLoadA" style="display:none;" :href="downLoadHref">{{ $t('table.download') }}</a>
    </div>

    <!-- 分栏组件 -->
    <div class="filter-container">
      <el-radio-group v-model="tabPosition" @change="clickTab(tabPosition)" >
        <el-radio-button label="-1"> {{ $t('table.all') }}</el-radio-button>
        <el-radio-button label="0"> {{ $t('order.status.noPay') }}</el-radio-button>
        <el-radio-button label="1"> {{ $t('order.status.noSend') }}</el-radio-button>
        <el-radio-button label="2"> {{ $t('order.status.isSend') }}</el-radio-button>
        <el-radio-button label="3"> {{ $t('order.status.noReturn') }}</el-radio-button>
        <el-radio-button label="4"> {{ $t('order.status.confirm') }}</el-radio-button>
        <el-radio-button label="5"> {{ $t('order.status.fail') }}</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 列表组件 
    <common-table
      ref="commonTable"
      :listLoading="listLoading"
      :list="list"
      :total="total"
      :listQuery="listQuery"
      :tableConfig="tableConfig"
      :tableCommonBtnShowConfig="tableCommonBtnShowConfig"
      @myGetList="myGetList"
      @handleUpdate="handleUpdate"
      @myHandleDelete="myHandleDelete"
    ></common-table>
    -->
    
    <!-- 列表组件 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.userNick')" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.username')" class-name="status-col"  align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column  :label="$t('delivery.orderSn')" class-name="status-col"  align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.orderNo }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.billCreateTime')" class-name="status-col"  align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('order.payTime')" class-name="status-col"  align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.payTime ? scope.row.payTime : " -- " }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('delivery.costAmount')" class-name="status-col"  align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.realPayPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('delivery.payWays')" class-name="status-col"  align="center" width="100" >
        <template slot-scope="scope">
          <span>{{ payMap[scope.row.payment] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('delivery.status')" class-name="status-col"  width="100" align="center">
        <template slot-scope="scope">
          <span>{{ $t(statusMapLog[scope.row.status]) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('member.look') }}
          </el-button>
          <el-button v-if = "row.payment == 2 && row.status == 1"  type="primary" size="small" @click="handleWhatAppPay(row)">
            {{ $t('order.whatAppPay') }}
          </el-button>
          <el-button type="success" size="small" v-if="row.status == 3" @click="handleIsReturn(row)">
            {{$t('order.isReturn')}}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :size.sync="listQuery.size" @pagination="getList" />

    <!-- 弹框开始-->
    <el-dialog width="80%" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" class="editFrame checkForm">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="0px" class='formVisible'>
        <el-row style="padding: 20px 20px 0 60px ;">
          <el-col :span="12" class="orderInput">
            <el-form-item :label="$t('table.userNick') + '：'" prop="title" width="60">
              <el-input :value="temp.userName" :disabled="true" />
            </el-form-item>
            <el-form-item :label="$t('login.username') + '：'" prop="title">
              <el-input :value="temp.userId" :disabled="true" />
            </el-form-item>
            <el-form-item :label="$t('table.orderNumber')" prop="title">
              <el-input :value="temp.orderNo" :disabled="true" />
            </el-form-item>
            <el-form-item :label="$t('order.billCreateTime') + '：'" prop="title">
              <el-input :value="temp.createTime" :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="12" class="inputSelect">
            <el-form-item :label="$t('table.orderStatus')+ '：'" prop="title">
              <el-input :value="$t(statusMapLog[temp.status]) " :disabled="true" />
            </el-form-item>
            <el-form-item :label="$t('delivery.costAmount')+ '：'" prop="title">
              <el-input :value="temp.realPayPrice" :disabled="true" />
            </el-form-item>
            <el-form-item :label="$t('delivery.payWays') + '：'" prop="title">
              <el-input :value="$t(payMap[temp.payment])" prop="title" :disabled="true" />
              <!--
              <el-select v-model="temp.payment" class="filter-item" placeholder="Please select" >
                <el-option label="paytm" :value="1" />
                <el-option label="COD" :value="0" />
              </el-select>
              -->
            </el-form-item>
            <el-form-item :label="$t('order.payTime')+ '：'" prop="title">
              <el-input :value="temp.payTime" :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col class="detailAttr" :span="24">
            <template v-for="(item,index) in temp.orderGoodsList2">
              <el-form-item :key="index" class="lg" :label="$t('delivery.sellerName')+ '：'" prop="title">
                <el-input :value="item" :disabled="true" />
              </el-form-item>
              <div v-for="(item2,index2) in temp.orderGoodsList[item]">
                <el-form-item class="lg" :label="$t('goods.number')+ '：'">
                  <el-input :value="item2.goodsSn" :disabled="true" />
                </el-form-item>
                <el-form-item class="lg" :label="$t('goods.name')+ '：'">
                  <el-input :value="item2.goodsName" :disabled="true" />
                </el-form-item>
                <el-form-item class="lg" :label="$t('delivery.attrName')+ '：'" label-width="0px">
                  <el-input :value="JSON.parse(item2.goodsAttrValue).join('/')" :disabled="true" />
                </el-form-item>
                <el-form-item :label="$t('delivery.count')+ '：'" style='width: 300px;' label-width="0px">
                  <el-input :value="item2.goodsNumber" :disabled="true" />
                </el-form-item>
                <el-form-item class="lg" :label="$t('table.goodsCostPrice')+ '：'" label-width="0px">
                  <el-input :value="item2.goodsPrice" :disabled="true" />
                </el-form-item>
              </div>
            </template>
          </el-col>
        </el-row>
      </el-form>
      <div class="dialog-footer" align="right" style="padding-top:0;padding-bottom: 20px;">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('permission.confirm') }}
        </el-button>
      </div>
      <div class="log">
        <ul>
          <li v-for="(item,index) in temp.log">
            <span class="time">
              {{ item.createTime }} -- {{ $t(statusMapLog[item.status]) }} -- {{item.description}}
            </span>
          </li>
        </ul>
      </div>
    </el-dialog>
    <!-- 弹框结束-->
  </div>
</template>

<script>
import { fetchList, delOrder, checkOrderLog, whatAppPay, execl, flushCache } from '@/api/order'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import SearchBox from '@/components/searchBox/index' //

export default {
  name: 'ComplexTable',
  components: { Pagination, SearchBox },
  directives: { waves },
  data() {
    return {
      downLoadHref: '',
      listLoading: true,
      sendStatus: 0,
      tableKey: 0,
      list: null,
      total: 0,
      length: 0,
      //搜索组件相关
      tabPosition: '-1',
      selectSearch: {
        order_type: 1
      },

      listQuery: {
        page: 1,
        size: 10
      },
       //配置table的展示
      tableConfig: [
        {
          label: "table.catName",
          type: "span",
          content: "catName"
        },
        {
          label: "table.isDisplay",
          type: "buttonConfig",
          classType: "isShow",
          buttonChange: this.handleChangeStatus
        },
        {
          label: "table.id",
          type: "span",
          content: "catId",
          sortable: true,
          prop: "catId"
        },
        {
          label: "table.sort",
          type: "span",
          content: "sortOrder",
          sortable: true,
          width: "200",
          prop: "sortOrder"
        },
        {
          label: "table.set",
          type: "classifyBtnConfig",
          width: "330",
          transform: this.handleTransformGoods,
          checkNext: this.handlecheckNextLevel
        }
      ],
      btnGroup: ['search','export','reset'],
      searchConfig: [{
        dataModel: 'order_no',
        type: 'input',
        placeholder: 'table.orderNumber',
        options: []
      }, {
        dataModel: 'user_name',
        type: 'input',
        placeholder: 'table.username',
        options: []
      }, {
        dataModel: 'goods_sn',
        type: 'input',
        placeholder: 'table.goodsSn',
        options: []
      }, {
        dataModel: 'payment',
        type: 'select',
        placeholder: 'table.payWays',
        options: [
          { label: 'PayTM', value: '1' },
          { label: 'WhatApp', value: '2' },
          { label: 'ShareIt', value: '3' },
          { label: 'PayPal', value: '4' },
          { label: 'COD', value: '0'}]
      }, {
        dataModel: 'start_time',
        type: 'date',
        placeholder: 'table.startTime'
      }, {
        dataModel: 'end_time',
        type: 'date',
        placeholder: 'table.endTime'
      }, {
        dataModel: 'shop_name',
        type: 'input',
        placeholder: 'table.goodsSeller',
        options: []
      }],
      importanceOptions: [1, 2, 3],
      statusOptions: ['1', '2'],
      showReviewer: false,

      //弹框组件相关
      payMap: {
        0: 'COD',
        1: 'PayTM',
        2: 'WhatApp',
        3: 'ShareIt',
        4: 'PayPal'
      },
      // 1.待支付 2.待发货 3.待收货 4.交易成功 5.交易失败 6.已取消 7.已关闭
      statusMapLog: { // 这个是订单详情，流水的更详细的的状态
        1: 'order.status.noPay',
        2: 'order.status.noSend',
        3: 'order.status.isSend',
        4: 'order.status.confirm',
        5: 'order.status.fail',
        9: 'order.status.cancel',
        7: 'order.status.close'
      },
      orderTypeMap: {
        1: 'order.normalOrder',
        2: 'order.teamOrder',
        3: 'order.resellerOrder'
      },
      temp: {
        id: undefined,
        log: [],
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('table.orderDetails'),
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 头部的按钮获取不同状态的列表数据
    changeStatus(order_status) {
      this.listQuery.order_status = order_status
      this.sendStatus = order_status
      this.getList()
    },
    getSearchSelect() {
      // 处理查询条件
      const selectKey = Object.keys(this.selectSearch)
      const newSelect = []
      if (selectKey && selectKey.length > 0) {
        newSelect.push({ 'name': 'create_time', 'type': 'desc','value': 1})
        selectKey.forEach((item, index) => {
          if (this.selectSearch[item]) {
            switch (item) {
              case 'start_time':
                newSelect.push({ 'name': 'create_time', 'type': 'gt', 'value': this.selectSearch[item] })
                break
              case 'end_time':
                newSelect.push({ 'name': 'create_time', 'type': 'lt', 'value': this.selectSearch[item] })
                break
              default:
                newSelect.push({ 'name': item, 'type': 'eq', 'value': this.selectSearch[item] })
                break
            }
          }
        })
      }
      this.listQuery.select = newSelect
    },
    getList() {
      this.listLoading = true
      // 处理查询条件
      this.getSearchSelect()
      fetchList(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      }).catch(res => {
        this.listLoading = false
      })
    },

    //查询组件 start
    clickTab(tab, event) {
      this.listQuery = {
        page: 1,
        size: 10
      }
      if( tab === '-1') {
        this.selectSearch.status = undefined
      } else {
        this.selectSearch.status = tab
      }
      this.getList()
    },
    // 1.待支付 2.代发货 3.待收货 4.交易成功 5.交易失败 6.退款
    handleFilter() { // 搜索
      this.listQuery = {
        page: 1,
        size: 10
      }
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    handleReset() {
      this.selectSearch = {
        order_type: 1
      }
      //this.tabPosition= '-1'
      this.handleFilter()
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleFlush(row) {
      flushCache(row.order_no).then(() => {
        this.$notify({
          title: (this.$t('delivery.orderSuccess')),
          message: (this.$t('delivery.createdSuccessfully')),
          type: 'success',
          duration: 2000
        })
      })
    },
    //查询组件 end
    handleUpdate(row) {
      checkOrderLog({ order_id: row.orderNo }).then(res => {
        this.$set(this.temp, 'log', res.data)
      })
      this.temp = Object.assign({}, row) // copy obj
      const orderGoodsList2 = Object.keys(this.temp.orderGoodsList)
      this.temp.orderGoodsList2 = orderGoodsList2
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        this.dialogFormVisible = false
        // 没有接口先直接关闭
        // if (valid) {
        //   const tempData = Object.assign({}, this.temp)
        //   tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
        //   updateArticle(tempData).then(() => {
        //     for (const v of this.list) {
        //       if (v.id === this.temp.id) {
        //         const index = this.list.indexOf(v)
        //         this.list.splice(index, 1, this.temp)
        //         break
        //       }
        //     }
        //     this.dialogFormVisible = false
        //     this.$notify({
        //       title: '成功',
        //       message: '更新成功',
        //       type: 'success',
        //       duration: 2000
        //     })
        //   })
        // }
      })
    },
    handleWhatAppPay(row) {
      this.$confirm(this.$t('order.message.whatAppPayMsg'), this.$t('order.message.whatAppPayTitle'), {
        confirmButtonText: this.$t('table.confirm'),
        cancelButtonText: this.$t('table.cancel'),
        type: 'warning'
      }).then(() => {
        whatAppPay({ 'order_no': row.orderNo}).then(() => {
          this.getList()
          this.$message({
            type: 'success',
            message: this.$t('message.postSuccess')
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('message.postFail')
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('message.cancelMessage')
        })
      })
    },
    handleIsReturn(row){
      this.$confirm(this.$t('order.message.isReturnMsg'), this.$t('order.message.isReturnTitle'), {
        confirmButtonText: this.$t('table.confirm'),
        cancelButtonText: this.$t('table.cancel'),
        type: 'info'
      }).then(() => {
        // 这里后面换成确认已归还绘本的接口
        whatAppPay({ 'order_no': row.orderNo}).then(() => {
          this.getList()
          this.$message({
            type: 'success',
            message: this.$t('message.postSuccess')
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('message.postFail')
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('message.cancelMessage')
        })
      })
    },
    handleDelete(row) {
      this.$confirm(this.$t('message.delNotifyMsg'), this.$t('message.delNotifyTitle'), {
        confirmButtonText: this.$t('table.confirm'),
        cancelButtonText: this.$t('table.cancel'),
        type: 'warning'
      }).then(() => {
        delOrder({ 'order_no': row.orderNo }).then(() => {
          this.getList()
          this.$message({
            type: 'success',
            message: this.$t('message.delSuccess')
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('message.delFail')
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('message.cancelMessage')
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      this.getSearchSelect()
      execl({ select: this.listQuery.select }).then(res => {
        if (res.code == 5200 && res.data) {
          this.downLoadHref = res.data
          this.$nextTick(() => {
            this.downloadLoading = false
            this.$refs.downLoadA.click()
          })
        }
      })
      // import('@/vendor/Export2Excel').then(excel => {
      //   const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
      //   const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
      //   const data = this.formatJson(filterVal, this.list)
      //   excel.export_json_to_excel({
      //     header: tHeader,
      //     data,
      //     filename: 'table-list'
      //   })
      //   this.downloadLoading = false
      // })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>

<style lang="scss">
.checkForm{
  .detailAttr{
  .el-form-item{
    display: inline-block;
  }
  .el-input.el-input--medium{
    width:50px;
  }
  .lg .el-input.el-input--medium{
    width:150px;
  }
  }
}
.btnOut{
    margin-bottom:10px;
    .active{
      background:#e64242;
      border-color: #e64242
    }
  }
.orderInput>div>div input ,.rightInput input {
  border: none;
  outline: none;
  padding: 0;
  background-color: #FFFFFF!important;
  color: #606266!important;
}
.inputSelect>div>div input {
  background-color: #FFFFFF!important;
  color: #606266!important;
}
</style>
