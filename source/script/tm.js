// ©.
// https://github.com/sizet/tree_menu

function treemenu(
    _variable_name,
    _div_id,
    _target_frame)
{
    function node_info()
    {
        this.node_name = "";
        this.list_index = -1;
        this.level_index = -1;
        this.parent_index = -1;
        this.child_count = 0;
        this.last_child_index = -1;
        this.next_neighbor_index = -1;
        this.is_group_last = 0;
        this.menu_text = "";
        this.text_row_count = 0;
        this.link_url = "";
        this.table_object = null;
        this.img_signal_object = null;
        this.img_icon_object = null;
        this.img_row_fill_object = null;
        this.is_active = 0;
    }


    var node_list = new Array();
    var focus_index = -1;
    var variable_name = _variable_name;
    var div_id = _div_id;
    var target_frame = _target_frame;
    // 使用的 id 的前綴.
    var table_id_prefix = "tm_table_";
    var td_image_id_prefix = "tm_td_image_";
    var td_text_id_prefix = "tm_td_text_";
    var img_signal_id_prefix = "tm_img_signal_";
    var img_icon_id_prefix = "tm_img_icon_";
    var img_multiple_fill_id_prefix = "tm_img_multiple_fill_";
    // 使用的 CSS 樣式.
    var div_style = "css_tm_div";
    var table_style = "css_tm_table";
    var td_image_style = "css_tm_td_image";
    var td_text_style = "css_tm_td_text";
    var img_style = "css_tm_img";
    // 使用的圖片.
    var image_path = "../source/image/";
    var image_folder_fold = image_path + "tm_folder_fold.png";
    var image_folder_unfold = image_path + "tm_folder_unfold.png";
    var image_file_fold = image_path + "tm_file_fold.png";
    var image_file_unfold = image_path + "tm_file_unfold.png";
    var image_signal_fold_branch = image_path + "tm_signal_fold_branch.png";
    var image_signal_fold_bottom = image_path + "tm_signal_fold_bottom.png";
    var image_signal_unfold_branch = image_path + "tm_signal_unfold_branch.png";
    var image_signal_unfold_bottom = image_path + "tm_signal_unfold_bottom.png";
    var image_line_vertical = image_path + "tm_line_vertical.png";
    var image_line_branch = image_path + "tm_line_branch.png";
    var image_line_bottom = image_path + "tm_line_bottom.png";
    var image_empty = image_path + "tm_empty.png";


    document.getElementById(div_id).className = div_style;


    // 找到名稱相同的 node.
    function search_node_by_name(
        target_name)
    {
        var nidx;


        for(nidx = 0; nidx < node_list.length; nidx++)
            if(target_name == node_list[nidx].node_name)
                return node_list[nidx];

        return null;
    }

    // 查詢 node 要插入在 parent-node 之後的何處.
    function search_node_insert_location(
        target_node)
    {
        // 插入位置在 parent-node 的 child-node 以及 grandson-node 之後.
        while(target_node.child_count > 0)
            target_node = node_list[target_node.last_child_index];

        return target_node.list_index + 1;
    }

    // 計算要顯示的選單文字有幾行.
    function calculate_row_count(
        target_text)
    {
        return target_text.split("<br>").length - 1;
    }

    // 填充 img 類型的元素的內容.
    function fill_img_element(
        img_id,
        img_src)
    {
        return "<img " +
               (img_id.length > 0 ? "id='" + img_id + "' " : "") +
               "class='" + img_style + "' " +
               "src='" + img_src + "'>";
    }

    // 填充 a 類型的元素的內容.
    function fill_a_element(
        a_herf,
        a_content)
    {
        return "<a href='javascript:" + a_herf + "'>" + a_content + "</a>";
    }

    // 把資料夾的圖片更改為展開或摺疊.
    function change_folder_image(
        target_node,
        folder_status)
    {
        var lidx;


        if(folder_status == 0)
        {
            target_node.is_active = 0;
            // root-node 前面沒有 "+" 或 "-", 不用替換.
            if(target_node.level_index > 0)
            {
                // "-" 換成 "+", 表示摺疊.
                target_node.img_signal_object.src = target_node.is_group_last == 0 ?
                    image_signal_fold_branch : image_signal_fold_bottom;
            }
            // 換成 "摺疊資料夾".
            target_node.img_icon_object.src = image_folder_fold;

            for(lidx = 0; lidx < target_node.text_row_count; lidx++)
                target_node.img_row_fill_object[lidx].src = image_empty;
        }
        else
        {
            target_node.is_active = 1;
            // root-node 前面沒有 "+" 或 "-", 不用替換.
            if(target_node.level_index > 0)
            {
                // "+" 換成 "-", 表示展開.
                target_node.img_signal_object.src = target_node.is_group_last == 0 ?
                    image_signal_unfold_branch : image_signal_unfold_bottom;
            }
            // 換成 "展開資料夾".
            target_node.img_icon_object.src = image_folder_unfold;

            for(lidx = 0; lidx < target_node.text_row_count; lidx++)
                target_node.img_row_fill_object[lidx].src = image_line_vertical;
        }
    }

    // 摺疊資料夾.
    function action_fold(
        target_node)
    {
        var nidx, last_index;


        change_folder_image(target_node, 0);

        for(each_node = target_node; each_node.child_count > 0;
            each_node = node_list[each_node.last_child_index]);
        last_index = each_node.list_index;

        for(nidx = each_node.list_index; nidx > target_node.list_index; nidx--)
            node_list[nidx].table_object.style.display = "none";
    }

    // 展開資料夾.
    function action_unfold(
        target_node,
        recursive_flag)
    {
        var nidx, each_node;


        // 變更 tager-node 的圖片.
        if(recursive_flag == 0)
            change_folder_image(target_node, 1);

        // 顯示 child-node.
        for(nidx = target_node.list_index + 1; nidx > -1; nidx = each_node.next_neighbor_index)
        {
            each_node = node_list[nidx];
            each_node.table_object.style.display = "";
            // 如果 child-node 是資料夾類型而且是在展開的模式, 處理 grandson-node.
            if(each_node.child_count > 0)
                if(each_node.is_active != 0)
                    action_unfold(each_node, 1);
        }
    }

    // 把檔案的圖片更改為展開或摺疊.
    function change_file_image(
        target_node,
        focus_status)
    {
        if(focus_status == 0)
        {
            // 換成 "摺疊檔案".
            target_node.is_active = 0;
            target_node.img_icon_object.src = image_file_fold;
        }
        else
        {
            // 換成 "展開檔案".
            target_node.is_active = 1;
            target_node.img_icon_object.src = image_file_unfold;
        }
    }

    // 點擊 "+" 或 "-" 的操作.
    this.do_click = function(
        node_index)
    {
        var target_node;


        target_node = node_list[node_index];

        if(target_node.is_active == 0)
            action_unfold(target_node, 0);
         else
            action_fold(target_node);
    }

    // 點擊資料或檔案的圖片或文字的操作.
    this.do_link = function(
        node_index)
    {
        var target_node;


        // 更換獲得焦點的 node.
        if(focus_index > -1)
        {
            target_node = node_list[focus_index];
            // 只對檔案類型的 node 更換圖片.
            if(target_node.child_count == 0)
                change_file_image(target_node, 0);
        }
        focus_index = node_index;

        target_node = node_list[node_index];

        if(target_node.child_count > 0)
        {
            if(target_node.is_active == 0)
                action_unfold(target_node, 0);
        }
        else
        {
            change_file_image(target_node, 1);
        }

        if(target_node.link_url.length > 0)
            target_frame.location = target_node.link_url;
    }

    // 讓目標取得焦點, 並展開路徑上的資料夾.
    this.do_trigger = function(
        node_name)
    {
        var target_node, each_node;


        target_node = search_node_by_name(node_name);
        if(target_node == null)
        {
            alert("error, unknown node [%s]", node_name);
            return -1;
        }

        // 更換獲得焦點的 node.
        if(focus_index > -1)
        {
            each_node = node_list[focus_index];
            if(each_node.child_count == 0)
                change_file_image(each_node, 0);
        }
        focus_index = target_node.list_index;

        // 如果 target-node 是檔案則更換為展開的圖片.
        if(target_node.child_count == 0)
            change_file_image(target_node, 1);

        // 先設定路徑上的資料夾為展開, 之後由上層做展開處理.
        for(each_node = target_node; each_node.level_index > 0;
            each_node = node_list[each_node.parent_index])
        {
            if(each_node.is_active == 0)
                change_folder_image(target_node, 1);
        }
        // 展開.
        action_unfold(each_node, 0);

        if(target_node.link_url.length > 0)
            target_frame.location = target_node.link_url;
    }

    // 初始化.
    this.init = function()
    {
        var div_element;


        div_element = document.getElementById(div_id);
        while(div_element.hasChildNodes())
            div_element.removeChild(div_element.firstChild);

        node_list = [];

        focus_index = -1;
    }

    // 增加 node.
    this.add = function(
        node_name,
        parent_name,
        menu_text,
        link_url)
    {
        var new_node, parent_node, neighbor_node, insert_index, nidx;


        if(search_node_by_name(node_name) != null)
        {
            alert("error, node [%s] has exist", node_name);
            return -1;
        }

        if(parent_name == "")
        {
            if(node_list.length != 0)
            {
                alert("error, duplic root [%s]", node_name);
                return -1;
            }
            parent_node = null;
            insert_index = 0;
        }
        else
        {
            parent_node = search_node_by_name(parent_name);
            if(parent_node == null)
            {
                alert("error, unknown parent [%s]", parent_name);
                return -1;
            }

            // 尋找要插入在 parent-node 之後的位置.
            insert_index = search_node_insert_location(parent_node);
        }

        new_node = new node_info();
        new_node.node_name = node_name;
        new_node.list_index = insert_index;
        new_node.level_index = parent_node == null ? 0 : parent_node.level_index + 1;
        new_node.parent_index = parent_node == null ? -1 : parent_node.list_index;
        new_node.is_group_last = 1;
        new_node.menu_text = menu_text;
        new_node.text_row_count = calculate_row_count(menu_text);
        new_node.link_url = link_url;
        node_list.splice(insert_index, 0, new_node);

        // 調整插入位置之後的 node 的 list_index.
        for(nidx = insert_index + 1; nidx < node_list.length; nidx++)
            node_list[nidx].list_index++;

        if(parent_node != null)        
        {
            if(parent_node.child_count > 0)
            {
                neighbor_node = node_list[parent_node.last_child_index];
                neighbor_node.next_neighbor_index = insert_index;
                neighbor_node.is_group_last = 0;
            }

            parent_node.child_count++;
            parent_node.last_child_index = insert_index;
        }
    }

    // 顯示選單.
    this.show = function()
    {
        var nidx, lidx, each_node, tmp_node, tmp_html, tmp_element, tmp_data;
        var tmp_ima_signal_id, tmp_img_icon_id, tmp_img_row_fill_id;
        var table_element, tr_element, td_image_element, td_text_element;


        for(nidx = 0; nidx < node_list.length; nidx++)
        {
            each_node = node_list[nidx];

            tmp_html = "";

            // 填充開頭部分, 例如 :
            // # nut
            // + # system
            // | + # date
            // + # log
            //   + # security
            //
            // level_index 是 0 的 node (nut), 開頭不需要填充.
            // level_index 是 1 的 node (system, log), 開頭不需要填充.
            // level_index 是 2 以上的 node (date, security), 需要填充 "|" 或 " " 部分.
            if(each_node.level_index > 1)
            {
                for(tmp_node = node_list[each_node.parent_index]; tmp_node.level_index > 0;
                    tmp_node = node_list[tmp_node.parent_index])
                {
                    tmp_data = tmp_node.is_group_last == 0 ? image_line_vertical : image_empty;
                    tmp_html = fill_img_element("", tmp_data) + tmp_html;
                }
            }

            // 填充號誌部分, 例如 :
            // # nut
            // + # system
            // | + # date
            // + # log
            //   + # security
            //
            // level_index 是 0 的 node (nut), 開頭不需要填充.
            // level_index 是 1 以上的 node (system, log, date, security), 需要填充 "+" 部分.
            if(each_node.level_index > 0)
            {
                // 資料夾類型的 node 是顯示 "+" 或 "-".
                if(each_node.child_count > 0)
                {
                    tmp_ima_signal_id = img_signal_id_prefix + each_node.list_index;
                    tmp_data = each_node.is_group_last == 0 ?
                               image_signal_fold_branch : image_signal_fold_bottom;
                    tmp_element = fill_img_element(tmp_ima_signal_id, tmp_data);
                    tmp_data = variable_name + ".do_click(" + each_node.list_index + ");";
                    tmp_element = fill_a_element(tmp_data, tmp_element);
                }
                // 檔案類型的 node 是顯示一般的線段.
                else
                {
                    tmp_data = each_node.is_group_last == 0 ?
                               image_line_branch : image_line_bottom;
                    tmp_element = fill_img_element("", tmp_data);
                }
                tmp_html += tmp_element;
            }

            // 填充圖示部分 (資料夾或檔案), 例如 :
            // # nut
            // + # system
            // | + # date
            // + # log
            //   + # security
            //
            // 填充 "#" 部分.
            tmp_img_icon_id = img_icon_id_prefix + each_node.list_index;
            tmp_data = each_node.child_count > 0 ? image_folder_fold : image_file_fold;
            tmp_element = fill_img_element(tmp_img_icon_id, tmp_data);
            tmp_data = variable_name + ".do_link(" + each_node.list_index + ");";
            tmp_element = fill_a_element(tmp_data, tmp_element);
            tmp_html += tmp_element;

            // 填充多行文字的圖片部分, 例如 :
            // # nut
            // + # system -
            // |   setting
            // | + # date
            // + # log
            //   + # security -
            //       message
            //
            // 填充 (setting, message) 前面部分.
            // 資料夾類型需要在展開或摺疊時作圖片更換的處理.
            if(each_node.text_row_count > 0)
                if(each_node.child_count > 0)
                    tmp_img_row_fill_id = new Array(each_node.text_row_count);
            for(lidx = 0; lidx < each_node.text_row_count; lidx++)
            {
                if(each_node.child_count > 0)
                {
                    tmp_img_row_fill_id[lidx] = img_multiple_fill_id_prefix +
                                                each_node.list_index + "_" + lidx;
                    tmp_data = tmp_img_row_fill_id[lidx];
                }
                else
                {
                    tmp_data = "";
                }
                tmp_element = fill_img_element(tmp_data, image_empty);
                for(tmp_node = each_node; tmp_node.level_index > 0;
                    tmp_node = node_list[tmp_node.parent_index])
                {
                    tmp_data = tmp_node.is_group_last == 0 ? image_line_vertical : image_empty;
                    tmp_element = fill_img_element("", tmp_data) + tmp_element;
                }
                tmp_html += "<br>" + tmp_element;
            }

            // 填充圖片部分.
            td_image_element = document.createElement("td");
            td_image_element.id = td_image_id_prefix + each_node.list_index;
            td_image_element.className = td_image_style;
            td_image_element.innerHTML = tmp_html;

            // 設定選單文字.
            tmp_data = variable_name + ".do_link(" + each_node.list_index + ");";
            tmp_element = fill_a_element(tmp_data, each_node.menu_text);

            // 填充文字部分.
            td_text_element = document.createElement("td");
            td_text_element.id = td_text_id_prefix + each_node.list_index;
            td_text_element.className = td_text_style;
            td_text_element.innerHTML = tmp_element;

            tr_element = document.createElement("tr");
            tr_element.appendChild(td_image_element);
            tr_element.appendChild(td_text_element);

            table_element = document.createElement("table");
            table_element.id = table_id_prefix + each_node.list_index;
            table_element.className = table_style;
            table_element.style.display = nidx == 0 ? "" : "none";
            table_element.appendChild(tr_element);

            document.getElementById(div_id).appendChild(table_element);

            // 紀錄 node 所在的 table 的元素.
            each_node.table_object = table_element;
            // 如果是資料夾類型而且不是 root-node, 紀錄顯示 "+" 或 "-" 圖片的元素.
            if(each_node.level_index > 0)
                if(each_node.child_count > 0)
                    each_node.img_signal_object = document.getElementById(tmp_ima_signal_id);
            // 紀錄顯示資料夾或檔案的圖片的元素.
            each_node.img_icon_object = document.getElementById(tmp_img_icon_id);
            // 紀錄多行文字時填充的圖片的元素.
            if(each_node.text_row_count > 0)
                if(each_node.child_count > 0)
                {
                    each_node.img_row_fill_object = new Array(each_node.text_row_count);
                    for(lidx = 0; lidx < each_node.text_row_count; lidx++)
                    {
                        each_node.img_row_fill_object[lidx] =
                            document.getElementById(tmp_img_row_fill_id[lidx]);
                    }
                }
        }

        // 展開 root-node.
        this.do_link(0);
    }
}
