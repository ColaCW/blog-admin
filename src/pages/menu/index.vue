<template>
  <div id="app">
    <el-container style="height: 100%">
      <el-aside width="200px">
        <div class="logo">
          LGQ博客系统
        </div>
        <el-menu class="el-menu-box" style="height: 94%" background-color="#272b2e" text-color="rgba(255, 255, 255, 0.65)">
          <template v-for="(menu, index) in menus">
            <template v-if="menu.parentId == 0 && menu.hide === 0">
              <el-submenu :key="menu.id" :index="menu.name">
                <template slot="title">
                  <i :class="index == 0 ? 'el-icon-location' : 'el-icon-menu'"></i>
                  <span>{{ menu.name }}</span>
                </template>
                <el-menu-item-group>
                  <template v-for="menu1 in menus">
                    <template v-if="menu1.parentId == menu.id && menu1.hide === 0">
                      <el-menu-item :key="menu1.id" :index="menu1.name" @click="goMenu(menu1.href, menu1.name)">&nbsp;&nbsp;&nbsp;&nbsp;<i class="el-icon-star-off"></i>{{ menu1.name }}</el-menu-item>
                    </template>
                  </template>
                </el-menu-item-group>
              </el-submenu>
            </template>
          </template>
        </el-menu>
      </el-aside>
      <el-container>
        <el-main>
          <div v-if="topMenus && topMenus.length > 0">
            <el-tabs v-model="activeMenu" type="card" @tab-click="goTopMenu">
              <template v-for="(topMenu, index) in topMenus">
                <el-tab-pane :key="index" :label="topMenu.name" :name="topMenu.name"></el-tab-pane>
              </template>
            </el-tabs>
            <div>
              <router-view></router-view>
            </div>
          </div>
        </el-main>
        <el-footer style="text-align: center">
          Design by 刘国强个人博客 吉ICP备18002404号
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import router from '@/router/index.js';
import { getMenusByRole } from '@/api/blogAdmin';

export default {
  name: 'Main',
  components: {},
  data() {
    return {
      menus: [],
      user: null,
      chooseTopIndex: 0,
      topMenus: [{ name: '概览', href: '/home' }],
      activeMenu: '概览'
    };
  },
  mounted: function() {
    window.vue = this;
    router.push('/');
    this.init();
  },
  methods: {
    init() {
      let that = this;
      getMenusByRole().then(res => {
        that.menus = res.data;
      });
    },
    logout: function() {
      let that = this;
      that.$router.push('/Login');
    },
    goTopMenu: function(tab, event) {
      let that = this;
      that.chooseTopIndex = tab.index;
      that.$router.push(that.topMenus[that.chooseTopIndex].href);
      that.$forceUpdate();
    },
    goMenu: function(href, name) {
      let that = this;
      let flag = false;
      for (let i = 0; i < that.topMenus.length; i++) {
        if (href === that.topMenus[i].href) {
          that.chooseTopIndex = i;
          flag = true;
          break;
        }
      }
      if (!flag) {
        let data = {
          name: name,
          href: href
        };
        that.topMenus.push(data);
        that.chooseTopIndex = that.topMenus.length - 1;
      }
      that.activeMenu = name;
      that.$router.push(href);
      that.$forceUpdate();
    }
  }
};
</script>

<style lang="less" scoped>
.el-menu {
  border-right: 0;
}
/deep/ .el-submenu__title {
  text-align: left !important;
}
.el-submenu .el-menu-item {
  text-align: left;
}
.logo {
  height: 6%;
  line-height: 60px;
  background-color: #1c2327;
  color: #fff;
  text-align: center;
}
.marquee {
  color: white;
  font-size: 12px;
  position: absolute;
  width: 500px;
  left: 420px;
}
.user {
  position: absolute;
  right: 20px;
}
.user img {
  width: 30px;
  border-radius: 50%;
}
</style>
