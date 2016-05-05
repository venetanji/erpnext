// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.ui.form.on("Supplier", {
	before_load: function(frm) {
		frappe.setup_language_field(frm);
	},
	refresh: function(frm) {
		frm.dashboard.show_heatmap = true;
		frm.dashboard.heatmap_message = __('This is based on transactions against this Supplier. See timeline below for details');
		frm.dashboard.show_dashboard();

		if(frappe.defaults.get_default("supp_master_name")!="Naming Series") {
			frm.toggle_display("naming_series", false);
		} else {
			erpnext.toggle_naming_series();
		}

		if(frm.doc.__islocal){
	    	hide_field(['address_html','contact_html']);
			erpnext.utils.clear_address_and_contact(frm);
		}
		else {
		  	unhide_field(['address_html','contact_html']);
			erpnext.utils.render_address_and_contact(frm);
		}

		frm.events.add_custom_buttons(frm);
	},
	add_custom_buttons: function(frm) {
		// ["Supplier Quotation", "Purchase Order", "Purchase Receipt", "Purchase Invoice"].forEach(function(doctype, i) {
		// 	if(frappe.model.can_read(doctype)) {
		// 		frm.add_custom_button(__(doctype), function() {
		// 			frappe.route_options = {"supplier": frm.doc.name};
		// 			frappe.set_route("List", doctype);
		// 		}, __("View"));
		// 	}
		// 	if(frappe.model.can_create(doctype)) {
		// 		frm.add_custom_button(__(doctype), function() {
		// 			frappe.route_options = {"supplier": frm.doc.name};
		// 			new_doc(doctype);
		// 		}, __("Make"));
		// 	}
		// });
	},
});

cur_frm.fields_dict['default_price_list'].get_query = function(doc, cdt, cdn) {
	return{
		filters:{'buying': 1}
	}
}

cur_frm.fields_dict['accounts'].grid.get_field('account').get_query = function(doc, cdt, cdn) {
	var d  = locals[cdt][cdn];
	return {
		filters: {
			'account_type': 'Payable',
			'company': d.company,
			"is_group": 0
		}
	}
}
