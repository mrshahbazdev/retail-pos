import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // Onboarding
    {
      path: '/setup',
      name: 'setup',
      component: () => import('@renderer/views/onboarding/SetupWizard.vue')
    },
    // Auth
    {
      path: '/login',
      name: 'login',
      component: () => import('@renderer/views/auth/Login.vue')
    },
    // Main App Layout
    {
      path: '/',
      component: () => import('@renderer/components/layout/AppLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@renderer/views/dashboard/Dashboard.vue')
        },
        // POS
        {
          path: 'pos',
          name: 'pos',
          component: () => import('@renderer/views/pos/POS.vue')
        },
        // Products
        {
          path: 'products',
          name: 'products',
          component: () => import('@renderer/views/products/ProductList.vue')
        },
        {
          path: 'products/create',
          name: 'product-create',
          component: () => import('@renderer/views/products/ProductCreate.vue')
        },
        // Customers
        {
          path: 'customers',
          name: 'customers',
          component: () => import('@renderer/views/customers/CustomerList.vue')
        },
        // Sales
        {
          path: 'sales',
          name: 'sales',
          component: () => import('@renderer/views/sales/SaleList.vue')
        },
        // Suppliers
        {
          path: 'suppliers',
          name: 'suppliers',
          component: () => import('@renderer/views/suppliers/SupplierList.vue')
        },
        // Purchases
        {
          path: 'purchases',
          name: 'purchases',
          component: () => import('@renderer/views/purchases/PurchaseList.vue')
        },
        // Expenses
        {
          path: 'expenses',
          name: 'expenses',
          component: () => import('@renderer/views/expenses/ExpenseList.vue')
        },
        // Reports
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@renderer/views/reports/ReportsIndex.vue')
        },
        // Register
        {
          path: 'register',
          name: 'register',
          component: () => import('@renderer/views/register/RegisterManagement.vue')
        },
        // Settings
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@renderer/views/settings/SettingsIndex.vue')
        }
      ]
    }
  ]
})

export default router
