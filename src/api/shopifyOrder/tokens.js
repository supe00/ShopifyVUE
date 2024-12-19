import request from '@/utils/request'

// 查询token列表
export function listTokens(query) {
  return request({
    url: '/shopifyOrder/tokens/list',
    method: 'get',
    params: query
  })
}

// 查询token详细
export function getTokens(storeName) {
  return request({
    url: '/shopifyOrder/tokens/' + storeName,
    method: 'get'
  })
}

// 新增token
export function addTokens(data) {
  return request({
    url: '/shopifyOrder/tokens',
    method: 'post',
    data: data
  })
}

// 修改token
export function updateTokens(data) {
  return request({
    url: '/shopifyOrder/tokens',
    method: 'put',
    data: data
  })
}

// 删除token
export function delTokens(storeName) {
  return request({
    url: '/shopifyOrder/tokens/' + storeName,
    method: 'delete'
  })
}
