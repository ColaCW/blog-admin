<template>
  <div id="app">
    <el-container style="height: 100%">
      <el-aside width="200px">
        <div class="logo">
          LGQ博客系统
        </div>
        <el-menu class="el-menu-box" style="height: 94%" background-color="#272b2e" text-color="rgba(255, 255, 255, 0.65)">
          <template v-for="(menu, index) in menus">
            <template v-if="menu.parentId == 0 && menu.isValid == 10041001">
              <el-submenu :key="menu.id" :index="menu.name">
                <template slot="title">
                  <i :class="index == 0 ? 'el-icon-location' : 'el-icon-menu'"></i>
                  <span>{{ menu.name }}</span>
                </template>
                <el-menu-item-group>
                  <template v-for="subMenu in menus">
                    <template v-if="subMenu.parentId == menu.id && subMenu.isValid == 10041001">
                      <el-menu-item :key="subMenu.id" :index="subMenu.name" @click="goMenu(subMenu.href, subMenu.name)"
                        >&nbsp;&nbsp;&nbsp;&nbsp;<i class="el-icon-star-off"></i>{{ subMenu.name }}</el-menu-item
                      >
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
      getMenusByRole().then(res => {
        this.menus = res.data;
      });
    },
    logout: function() {
      this.$router.push('/Login');
    },
    goTopMenu: function(tab, event) {
      this.chooseTopIndex = tab.index;
      this.$router.push(this.topMenus[this.chooseTopIndex].href);
      this.$forceUpdate();
    },
    goMenu: function(href, name) {
      let flag = false;
      for (let i = 0; i < this.topMenus.length; i++) {
        if (href === this.topMenus[i].href) {
          this.chooseTopIndex = i;
          flag = true;
          break;
        }
      }
      if (!flag) {
        let data = {
          name: name,
          href: href
        };
        this.topMenus.push(data);
        this.chooseTopIndex = this.topMenus.length - 1;
      }
      this.activeMenu = name;
      this.$router.push(href);
      this.$forceUpdate();
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
