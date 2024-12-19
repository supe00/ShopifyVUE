<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="店铺名" prop="storeName">
        <el-input
            v-model="queryParams.storeName"
            placeholder="请输入店铺名"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['shopifyOrder:tokens:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['shopifyOrder:tokens:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['shopifyOrder:tokens:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['shopifyOrder:tokens:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tokensList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="店铺名" align="center" prop="storeName" />
      <el-table-column label=" API URL字段" align="center" prop="apiUrl" />
      <el-table-column label=" API Key" align="center" prop="apiKey" />
      <el-table-column label=" Access Token" align="center" prop="accessToken" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['shopifyOrder:tokens:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['shopifyOrder:tokens:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改token对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="tokensRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label=" 店铺名 " prop="storeName">
          <el-input v-model="form.storeName" placeholder="请输入 Shopify店铺名" :disabled="data.isStoreNameDisabled"/>
        </el-form-item>
        <el-form-item label=" API URL" prop="apiUrl">
          <el-input v-model="form.apiUrl" placeholder="请输入 API URL 例如: " />
        </el-form-item>
        <el-form-item label=" API Key " prop="apiKey">
          <el-input v-model="form.apiKey" placeholder="请输入 API KEY" />
        </el-form-item>
        <el-form-item label="Access Token" prop="accessToken">
          <el-input v-model="form.accessToken" placeholder="请输入 Access Token" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Tokens">
import { listTokens, getTokens, delTokens, addTokens, updateTokens } from "@/api/shopifyOrder/tokens";

const { proxy } = getCurrentInstance();

const tokensList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    storeName: null,
    apiUrl: null,
    apiKey: null,
    accessToken: null,
  },
  rules: {
    storeName: [
      { required: true, message: "店铺名不能为空", trigger: "blur" }
    ],
    apiUrl: [
      { required: true, message: " Url不能为空 ", trigger: "blur" }
    ],
    apiKey: [
      { required: true, message: " Key 字段不能为空", trigger: "blur" }
    ],
    accessToken: [
      { required: true, message: " Access Token 字段不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询token列表 */
function getList() {
  loading.value = true;
  listTokens(queryParams.value).then(response => {
    tokensList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    storeName: null,
    apiUrl: null,
    apiKey: null,
    accessToken: null,
    delFlag: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("tokensRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.storeName);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加token";
  data.isStoreNameDisabled = false;
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _storeName = row.storeName || ids.value
  getTokens(_storeName).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改token";
    data.isStoreNameDisabled = true;
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["tokensRef"].validate(valid => {
    if (valid) {
      console.log('建立了')
      console.log(form.value.createBy)
      if (form.value.createBy != null) {
        updateTokens(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTokens(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _storeNames = row.storeName || ids.value;
  proxy.$modal.confirm('是否确认删除token编号为"' + _storeNames + '"的数据项？').then(function() {
    return delTokens(_storeNames);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('shopifyOrder/tokens/export', {
    ...queryParams.value
  }, `tokens_${new Date().getTime()}.xlsx`)
}

getList();
</script>
